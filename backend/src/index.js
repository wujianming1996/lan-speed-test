import express from 'express'
import cors from 'cors'
import http from 'http'
import { WebSocketServer } from 'ws'
import crypto from 'crypto'

const app = express()
const server = http.createServer(app)
const wss = new WebSocketServer({ server })

app.use(cors())

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
  const duration = Math.min(parseInt(req.query.duration) || 10, 30)
  const chunkSize = 256 * 1024

  res.writeHead(200, {
    'Content-Type': 'application/octet-stream',
    'Content-Length': size,
    'Cache-Control': 'no-store',
    'Access-Control-Expose-Headers': '*'
  })

  const buf = crypto.randomBytes(chunkSize)
  let sent = 0

  function writeChunk() {
    if (sent >= size) {
      res.end()
      return
    }
    const remaining = size - sent
    const sendSize = Math.min(chunkSize, remaining)
    sent += sendSize
    res.write(sendSize === chunkSize ? buf : buf.subarray(0, sendSize), writeChunk)
  }

  writeChunk()
})

app.post('/api/speedtest/upload', express.raw({ limit: '200mb', type: 'application/octet-stream' }), (req, res) => {
  const elapsed = req.body ? req.body.length / (50 * 1024) : 0
  const received = req.body ? req.body.length : 0
  const duration = elapsed > 0 ? elapsed : 0.1
  const avgBps = received * 8 / duration

  res.json({
    bandwidth: formatBandwidth(avgBps),
    transfer: formatBytes(received),
    duration: Math.round(duration * 100) / 100,
    intervals: []
  })
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
    } catch {}
  })
})

function formatBandwidth(bps) {
  if (!bps || !isFinite(bps)) return '0 bps'
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
