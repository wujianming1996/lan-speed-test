# 🌐 LAN Speed Test

> [English](README.md)

内网吞吐量测量工具，带现代化 Web 界面。

## 功能特性

- ⚡ **浏览器测速** - 直接从浏览器测量下载/上传带宽
- 📡 **Ping 测试** - 通过 WebSocket 测量到目标主机的延迟
- 📊 **实时图表** - 使用 ApexCharts 可视化带宽图表
- 🐳 **Docker Compose** - 一键部署
- 🌐 **Web UI** - Vue 3 + Vite 前端，深色主题，H5 手机端适配
- 🌏 **双语支持** - 中文 / English 国际化

## 快速开始

```bash
docker compose up -d
```

浏览器打开 `http://localhost:8082`。

## 架构

```
┌─────────────┐     ┌─────────────┐
│  前端       │────▶│  后端       │
│  Vue 3/Nginx│     │  Express.js │
│   :8082     │     │   :3002     │
└─────────────┘     └─────────────┘
```

## 使用方法

### Web 界面

1. 打开 `http://localhost:8082`
2. 进入 **测速** 标签页
3. 选择下载或上传
4. 点击"开始测试"查看实时结果

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

编辑 `docker-compose.yml` 修改端口。

## 打赏

如果这个项目对你有帮助，可以请我喝杯咖啡 ☕

<p align="left">
  <img src="assets/微信.png" width="200" alt="微信">
  <img src="assets/支付宝.jpg" width="200" alt="支付宝" style="margin-left:20px">
</p>

## License

MIT
