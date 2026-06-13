<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const serverInfo = ref(null)
const stats = ref({
  uptime: '--',
  version: '--',
  connections: 0
})

onMounted(async () => {
  try {
    const res = await axios.get('/api/status')
    serverInfo.value = res.data
    stats.value = res.data
  } catch {
    // backend not available
  }
})
</script>

<template>
  <div class="home">
    <div class="hero">
      <h1>LAN Speed Test</h1>
      <p>Internal network throughput measurement tool</p>
      <div class="hero-actions">
        <button class="btn btn-primary" @click="router.push('/speedtest')">
          ⚡ Start Speed Test
        </button>
        <button class="btn btn-primary" @click="router.push('/ping')">
          📡 Ping Test
        </button>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <h3>Quick Start</h3>
        <ol class="steps">
          <li>Select an iperf3 server from the list</li>
          <li>Choose download or upload test</li>
          <li>Wait for the test to complete</li>
          <li>View real-time bandwidth chart</li>
        </ol>
      </div>

      <div class="card">
        <h3>Server Status</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Status</span>
            <span class="info-value">
              <span class="status-badge ready">● Online</span>
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">Connections</span>
            <span class="info-value">{{ stats.connections || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  text-align: center;
}

.hero {
  padding: 3rem 0;
  margin-bottom: 2rem;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--accent), #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero p {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.steps {
  text-align: left;
  padding-left: 1.5rem;
}

.steps li {
  margin-bottom: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border);
}

.info-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.info-value {
  font-weight: 500;
}

.card h3 {
  margin-bottom: 1rem;
  text-align: left;
}
</style>
