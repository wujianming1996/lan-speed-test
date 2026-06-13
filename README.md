# 🌐 LAN Speed Test

> [中文](README.zh.md)

Internal network throughput measurement tool with a modern web UI.

## Features

- ⚡ **iPerf3 Speed Test** - Measure bandwidth (download/upload) using iPerf3
- 📡 **Ping Test** - Measure latency to target hosts
- 📊 **Real-time Charts** - Visual bandwidth graphs using ApexCharts
- 🐳 **Docker Compose** - One-command deployment
- 🌐 **Web UI** - Vue 3 + Vite frontend with dark theme

## Quick Start

```bash
docker compose up -d
```

Open `http://localhost:8080` in your browser.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│  Frontend   │────▶│   Backend   │────▶│ iperf3-server│
│  Vue 3/NGINX│     │  Express.js │     │   (Alpine)   │
│   :8080     │     │   :3000     │     │   :5201      │
└─────────────┘     └─────────────┘     └──────────────┘
```

## Usage

### Web UI

1. Navigate to `http://localhost:8080`
2. Go to **Speed Test** tab
3. Select server and direction (download/upload)
4. Click "Start Test" and view real-time results

### CLI (Direct)

```bash
# Download test
iperf3 -c <server-ip> -p 5201 -t 10

# Upload test
iperf3 -c <server-ip> -p 5201 -t 10 -R
```

## Development

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev
```

## Configuration

Edit `docker-compose.yml` to change ports or add additional iperf3 servers.

## Sponsorship

If this project helps you, consider buying me a coffee ☕

<p align="left">
  <img src="assets/微信.png" width="200" alt="WeChat">
  <img src="assets/支付宝.jpg" width="200" alt="Alipay" style="margin-left:20px">
</p>

## License

MIT
