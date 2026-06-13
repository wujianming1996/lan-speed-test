import express from 'express'
import cors from 'cors'
import http from 'http'
import { WebSocketServer } from 'ws'
import { execFile, execSync } from 'child_process'
import { randomUUID } from 'crypto'

const app = express()
const server = http.createServer(app)
const wss = new WebSocketServer({ server })

app.use(cors())
app.use(express.json())

const SERVERS = [
  { id: 'local', host: 'iperf3-server', port: 5201 }
]

app.get('/api/status', (req, res) => {
  res.json({
    uptime: process.uptime(),
    version: '1.0.0',
    connections: wss.clients.size
  })
})

app.get('/api/servers', (req, res) => {
  res.json(SERVERS)
})

app.post('/api/ping', (req, res) => {
  const { host, count = 4 } = req.body

  if (!host) {
    return res.status(400).json({ error: 'Host is required' })
  }

  execFile('ping', ['-c', String(count), host], { timeout: 30000 }, (err, stdout, stderr) => {
    if (err && err.code === 1) {
      const lines = stdout.split('\n')
      return res.json(parsePingOutput(lines, host))
    }
    if (err) {
      return res.status(500).json({ error: `Ping failed: ${stderr || err.message}` })
    }
    const lines = stdout.split('\n')
    res.json(parsePingOutput(lines, host))
  })
})

function parsePingOutput(lines, host) {
  const result = {
    host,
    transmitted: 0,
    received: 0,
    loss: 0,
    rtt_min: '-',
    rtt_avg: '-',
    rtt_max: '-',
    packets: []
  }

  for (const line of lines) {
    const icmpMatch = line.match(/(\d+) bytes from/)
    if (icmpMatch) {
      const seqMatch = line.match(/icmp_seq=(\d+)/)
      const timeMatch = line.match(/time=([\d.]+)\s*ms/)
      const ttlMatch = line.match(/ttl=(\d+)/)
      result.packets.push({
        seq: seqMatch ? parseInt(seqMatch[1]) : result.packets.length,
        time: timeMatch ? parseFloat(timeMatch[1]) : null,
        ttl: ttlMatch ? parseInt(ttlMatch[1]) : null
      })
    }

    const statsMatch = line.match(/(\d+)\s+packets transmitted/)
    if (statsMatch) {
      result.transmitted = parseInt(statsMatch[1])
      const receivedMatch = line.match(/(\d+)\s+received/)
      if (receivedMatch) result.received = parseInt(receivedMatch[1])
      const lossMatch = line.match(/([\d.]+)%\s+packet loss/)
      if (lossMatch) result.loss = parseFloat(lossMatch[1])
    }

    const rttMatch = line.match(/rtt min\/avg\/max\/mdev = ([\d.]+)\/([\d.]+)\/([\d.]+)/)
    if (rttMatch) {
      result.rtt_min = `${rttMatch[1]} ms`
      result.rtt_avg = `${rttMatch[2]} ms`
      result.rtt_max = `${rttMatch[3]} ms`
    }
  }

  return result
}

app.post('/api/speedtest', (req, res) => {
  const { server_id, direction = 'download', duration = 10 } = req.body

  if (!server_id) {
    return res.status(400).json({ error: 'Server ID is required' })
  }

  const server = SERVERS.find(s => s.id === server_id)
  if (!server) {
    return res.status(404).json({ error: 'Server not found' })
  }

  const args = ['-c', server.host, '-p', String(server.port), '-t', String(duration), '-J']

  if (direction === 'upload') {
    args.push('-R')
  }

  execFile('iperf3', args, { timeout: (duration + 10) * 1000 }, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ error: `iperf3 failed: ${stderr || err.message}` })
    }

    try {
      const data = JSON.parse(stdout)
      res.json(parseIperf3Output(data))
    } catch (e) {
      res.status(500).json({ error: 'Failed to parse iperf3 output' })
    }
  })
})

function parseIperf3Output(data) {
  const end = data.end
  const sum = end.sum_received || end.sum_sent || {}

  return {
    bandwidth: formatBandwidth(sum.bits_per_second),
    transfer: formatBytes(sum.bytes),
    duration: end.sum_sent?.seconds || end.sum_received?.seconds || 0,
    retransmits: sum.retransmits || 0,
    intervals: (data.intervals || []).map(iv => {
      const stream = iv.streams?.[0] || {}
      return {
        time: stream.seconds || 0,
        bits_per_second: stream.bits_per_second || 0,
        bytes: stream.bytes || 0,
        retransmits: stream.retransmits || 0
      }
    })
  }
}

function formatBandwidth(bps) {
  if (!bps) return '0 bps'
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
