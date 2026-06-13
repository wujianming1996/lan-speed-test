# 🌐 LAN Speed Test

> [中文](README.zh.md)

Internal network throughput measurement tool with a modern web UI.

## Features

- ⚡ **Browser Speed Test** - Measure download/upload bandwidth directly from your browser
- 📡 **Ping Test** - Measure latency to target hosts via WebSocket
- 📊 **Real-time Charts** - Visual bandwidth graphs using ApexCharts
- 🐳 **Docker Compose** - One-command deployment
- 🌐 **Web UI** - Vue 3 + Vite frontend with dark theme, H5 mobile support
- 🌏 **Bilingual** - Chinese / English i18n support

## Quick Start

```bash
docker compose up -d
```

Open `http://localhost:8082` in your browser.

## Architecture

```
┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│   Backend   │
│  Vue 3/Nginx│     │  Express.js │
│   :8082     │     │   :3002     │
└─────────────┘     └─────────────┘
```

## Usage

### Web UI

1. Navigate to `http://localhost:8082`
2. Go to **Speed Test** tab
3. Choose download or upload
4. Click "Start Test" and view real-time results

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

Edit `docker-compose.yml` to change ports.

## Sponsorship

If this project helps you, consider buying me a coffee ☕

<p align="left">
  <img src="assets/微信.png" width="200" alt="WeChat">
  <img src="assets/支付宝.jpg" width="200" alt="Alipay" style="margin-left:20px">
</p>

## License

MIT
