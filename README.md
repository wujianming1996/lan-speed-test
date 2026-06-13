<h1 align="center">🌐 LAN Speed Test</h1>

<p align="center">
  <em>English</em> | <a href="#zh">中文</a>
</p>

<a id="en"></a>

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
  <img src="assets/微信.png" width="200" alt="微信">
  <img src="assets/支付宝.jpg" width="200" alt="支付宝" style="margin-left:20px">
</p>

---

<a id="zh"></a>

<h1 align="center">🌐 LAN Speed Test</h1>

<p align="center">
  <a href="#en">English</a> | <em>中文</em>
</p>

内网吞吐量测量工具，带现代化 Web 界面。

## 功能特性

- ⚡ **iPerf3 测速** - 使用 iPerf3 测量下载/上传带宽
- 📡 **Ping 测试** - 测量到目标主机的延迟
- 📊 **实时图表** - 使用 ApexCharts 可视化带宽图表
- 🐳 **Docker Compose** - 一键部署
- 🌐 **Web UI** - Vue 3 + Vite 前端，深色主题

## 快速开始

```bash
docker compose up -d
```

浏览器打开 `http://localhost:8080`。

## 架构

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│  前端       │────▶│  后端       │────▶│ iperf3 服务器 │
│  Vue 3/Nginx│     │  Express.js │     │   (Alpine)   │
│   :8080     │     │   :3000     │     │   :5201      │
└─────────────┘     └─────────────┘     └──────────────┘
```

## 使用方法

### Web 界面

1. 打开 `http://localhost:8080`
2. 进入 **测速** 标签页
3. 选择服务器和方向（下载/上传）
4. 点击"开始测试"查看实时结果

### 命令行（直接）

```bash
# 下载测试
iperf3 -c <服务器IP> -p 5201 -t 10

# 上传测试
iperf3 -c <服务器IP> -p 5201 -t 10 -R
```

## 开发

```bash
# 前端
cd frontend
npm install
npm run dev

# 后端
cd backend
npm install
npm run dev
```

## 配置

编辑 `docker-compose.yml` 修改端口或添加更多 iperf3 服务器。

## 打赏

如果这个项目对你有帮助，可以请我喝杯咖啡 ☕

<p align="left">
  <img src="assets/微信.png" width="200" alt="微信">
  <img src="assets/支付宝.jpg" width="200" alt="支付宝" style="margin-left:20px">
</p>

## License

MIT
