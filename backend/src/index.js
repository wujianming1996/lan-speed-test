import express from 'express'
import cors from 'cors'
import http from 'http'
import { WebSocketServer } from 'ws'
import crypto from 'crypto'

const app = express()
const server = http.createServer(app)
const wss = new WebSocketServer({ server })

app.use(cors())
app.use(express.raw({ limit: '200mb', type: 'application/octet-stream' }))

let uploadState = { bytesReceived: 0, startTime: 0, intervals: [] }

app.get('/api/status', (req, res) => {
  res.json({
    uptime: process.uptime(),
    version: '1.0.0',
    connections: wss.clients.size
  })
})

app.get('/api/servers', (req, res) => {
  res.json([
    { id: 'local', host: 'localhost', port: 'this server' }
  ])
})

app.get('/api/speedtest/download', (req, res) => {
  const size = Math.min(parseInt(req.query.size) || 50 * 1024 * 1024, 200 * 1024 * 1024)
  const duration = parseInt(req.query.duration) || 10
  const chunkSize = 256 * 1024
  const startTime = process.hrtime.bigint()
  let totalSent = 0n
  let intervalStart = startTime
  let intervalBytes = 0n
  let intervalIndex = 0

  res.writeHead(200, {
    'Content-Type': 'application/octet-stream',
    'Content-Length': size,
    'Cache-Control': 'no-store',
    'Access-Control-Expose-Headers': '*'
  })

  const buf = crypto.randomBytes(chunkSize)
  let aborted = false

  req.on('close', () => { aborted = true })

  function writeChunk() {
    const now = process.hrtime.bigint()
    const elapsed = Number(now - startTime) / 1e9

    if (aborted || totalSent >= size || elapsed >= duration) {
      res.end()
      return
    }

    const remaining = size - Number(totalSent)
    const sendSize = Math.min(chunkSize, remaining)

    if (Number(now - intervalStart) / 1e9 >= 0.2) {
      const iElapsed = Number(now - intervalStart) / 1e9
      const bits = intervalBytes * 8n
      uploadState.intervals.push({
        time: elapsed,
        bits_per_second: Number(bits) / iElapsed,
        bytes: Number(intervalBytes)
      })
      intervalStart = now
      intervalBytes = 0n
    }

    totalSent += BigInt(sendSize)
    intervalBytes += BigInt(sendSize)

    res.write(sendSize === chunkSize ? buf : buf.subarray(0, sendSize), () => {
      setImmediate(writeChunk)
    })
  }

  writeChunk()
})

app.post('/api/speedtest/upload', (req, res) => {
  const startTime = process.hrtime.bigint()
  const contentLength = parseInt(req.headers['content-length']) || 0
  let received = 0

  uploadState = { bytesReceived: 0, startTime: Date.now(), intervals: [] }
  let lastInterval = startTime
  let intervalBytes = 0n

  req.on('data', (chunk) => {
    received += chunk.length
    const now = process.hrtime.bigint()
    intervalBytes += BigInt(chunk.length)

    if (Number(now - lastInterval) / 1e9 >= 0.2) {
      const elapsed = Number(now - lastInterval) / 1e9
      const bits = intervalBytes * 8n
      uploadState.intervals.push({
        time: Number(now - startTime) / 1e9,
        bits_per_second: Number(bits) / elapsed,
        bytes: Number(intervalBytes)
      })
      lastInterval = now
      intervalBytes = 0n
    }

    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          type: 'upload-progress',
          received,
          total: contentLength,
          elapsed: Number(process.hrtime.bigint() - startTime) / 1e9
        }))
      }
    })
  })

  req.on('end', () => {
    const elapsed = Number(process.hrtime.bigint() - startTime) / 1e9
    res.json({
      bandwidth: formatBandwidth(received * 8 / elapsed),
      transfer: formatBytes(received),
      duration: Math.round(elapsed * 100) / 100,
      intervals: uploadState.intervals
    })
  })
})

app.get('/api/ping/echo', (req, res) => {
  res.json({ timestamp: Date.now() })
})

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw)
      if (msg.type === 'ping') {
        ws.send(JSON.stringify({
          type: 'pong',
          seq: msg.seq,
          clientTime: msg.clientTime,
          serverTime: Date.now()
        }))
      }
    } catch {
      // ignore invalid messages
    }
  })
})

function formatBandwidth(bps) {
  if (!bps || bps === Infinity) return '0 bps'
  if (bps >= 1e9) return `${(bps / 1e9).toFixed(2)} Gbps`
  if (bps >= 1e6) return `${(bps / 1e6).toFixed(2)} Mbps`
  if (bps >= 1e3) return `${(bps / 1e3).toFixed(2)} Kbps`
  return `${bps.toFixed(2)} bps`
}

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(2)} KB`
  return `${bytes.toFixed(2)} B`
}

const PORT = process.env.PORT || 3000
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend API running on port ${PORT}`)
})
