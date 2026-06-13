<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const targetHost = ref('')
const status = ref('ready')
const results = ref(null)
const livePackets = ref([])

let ws = null
let pingInterval = null
let seq = 0

function getWsUrl() {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${location.host}/ws`
}

function startPing() {
  if (!targetHost.value || status.value === 'running') return

  status.value = 'running'
  results.value = null
  livePackets.value = []
  seq = 0

  ws = new WebSocket(getWsUrl())

  ws.onopen = () => {
    sendPings()
    pingInterval = setInterval(sendPings, 1000)
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.type === 'pong') {
      const rtt = Date.now() - data.clientTime
      livePackets.value.push({
        seq: data.seq,
        time: rtt,
        ttl: 64
      })
    }
  }

  ws.onerror = () => {
    status.value = 'error'
    results.value = { error: 'WebSocket connection failed' }
  }

  ws.onclose = () => {
    finishPing()
  }
}

function sendPings() {
  for (let i = 0; i < 1; i++) {
    ws.send(JSON.stringify({
      type: 'ping',
      seq: seq++,
      clientTime: Date.now()
    }))
  }
}

function finishPing() {
  clearInterval(pingInterval)
  if (livePackets.value.length === 0) {
    status.value = 'error'
    return
  }

  const times = livePackets.value.filter(p => p.time !== null).map(p => p.time)
  const transmitted = livePackets.value.length
  const received = times.length
  const loss = transmitted > 0 ? Math.round((1 - received / transmitted) * 10000) / 100 : 0

  results.value = {
    host: targetHost.value,
    transmitted,
    received,
    loss,
    rtt_min: times.length > 0 ? `${Math.min(...times).toFixed(2)} ms` : '-',
    rtt_avg: times.length > 0 ? `${(times.reduce((a, b) => a + b, 0) / times.length).toFixed(2)} ms` : '-',
    rtt_max: times.length > 0 ? `${Math.max(...times).toFixed(2)} ms` : '-',
    packets: livePackets.value
  }
  status.value = 'ready'
}

function stopPing() {
  clearInterval(pingInterval)
  if (ws) {
    ws.close()
    ws = null
  }
  finishPing()
}
</script>

<template>
  <div class="ping-test">
    <h2>{{ t('ping.title') }}</h2>
    <p class="subtitle">{{ t('ping.subtitle') }}</p>

    <div class="card">
      <div class="ping-controls">
        <div class="input-group">
          <label>{{ t('ping.target') }}</label>
          <input
            v-model="targetHost"
            :placeholder="t('ping.placeholder')"
            @keyup.enter="startPing"
            :disabled="status === 'running'"
          />
        </div>
        <button
          v-if="status !== 'running'"
          class="btn btn-primary"
          :disabled="!targetHost"
          @click="startPing"
        >
          📡 {{ t('ping.ping') }}
        </button>
        <button
          v-else
          class="btn btn-danger"
          @click="stopPing"
        >
          ⏹ {{ t('speedtest.stop') }}
        </button>
      </div>
    </div>

    <div v-if="status === 'error' && !results" class="card" style="border-color: var(--danger)">
      <p style="color: var(--danger)">{{ t('error.ping') }}</p>
    </div>

    <div v-if="status === 'running' || results" class="card">
      <h3>{{ t('ping.statistics') }}</h3>
      <div class="packet-stream" v-if="status === 'running'">
        <div v-for="pkt in livePackets" :key="pkt.seq" class="packet-line">
          <span class="packet-seq">#{{ pkt.seq }}</span>
          <span class="packet-time">{{ pkt.time }} ms</span>
        </div>
      </div>
      <div class="stats-grid" v-if="results">
        <div class="stat-item">
          <span class="stat-label">{{ t('ping.sent') }}</span>
          <span class="stat-value">{{ results.transmitted }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t('ping.received') }}</span>
          <span class="stat-value">{{ results.received }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t('ping.loss') }}</span>
          <span class="stat-value" :class="{ danger: results.loss > 0 }">{{ results.loss }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t('ping.min') }}</span>
          <span class="stat-value">{{ results.rtt_min }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t('ping.avg') }}</span>
          <span class="stat-value accent">{{ results.rtt_avg }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ t('ping.max') }}</span>
          <span class="stat-value">{{ results.rtt_max }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ping-test {
  max-width: 900px;
  margin: 0 auto;
}

.ping-controls {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.input-group {
  flex: 1;
}

.packet-stream {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 0.5rem;
}

.packet-line {
  display: flex;
  gap: 1rem;
  padding: 0.4rem 0;
  font-family: monospace;
  font-size: 0.9rem;
  border-bottom: 1px solid var(--border);
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.packet-seq {
  color: var(--text-secondary);
}

.packet-time {
  color: var(--accent);
  font-weight: 500;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 8px;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 600;
}

.stat-value.accent {
  color: var(--accent);
}

.stat-value.danger {
  color: var(--danger);
}

/* ===== Mobile ===== */
@media (max-width: 768px) {
  .ping-controls {
    flex-direction: column;
    gap: 0.75rem;
  }

  .ping-controls .btn {
    width: 100%;
  }

  .packet-line {
    font-size: 0.8rem;
    gap: 0.75rem;
  }

  .packet-stream {
    max-height: 200px;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .stat-item {
    padding: 0.85rem;
  }

  .stat-value {
    font-size: 1.1rem;
  }
}

@media (max-width: 375px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
