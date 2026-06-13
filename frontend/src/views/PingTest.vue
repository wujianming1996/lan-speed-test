<script setup>
import { ref } from 'vue'
import { useSpeedTestStore } from '../stores/speedtest'

const store = useSpeedTestStore()
const targetHost = ref('')

async function runPing() {
  if (!targetHost.value || store.status === 'running') return
  await store.startPing(targetHost.value)
}
</script>

<template>
  <div class="ping-test">
    <h2>Ping Test</h2>
    <p class="subtitle">Measure latency to a target host</p>

    <div class="card">
      <div class="ping-controls">
        <div class="input-group">
          <label>Target Host</label>
          <input
            v-model="targetHost"
            placeholder="e.g. 192.168.1.1 or google.com"
            @keyup.enter="runPing"
          />
        </div>
        <button
          class="btn btn-primary"
          :disabled="!targetHost || store.status === 'running'"
          @click="runPing"
        >
          {{ store.status === 'running' ? '⏳ Pinging...' : '📡 Ping' }}
        </button>
      </div>
    </div>

    <div v-if="store.error" class="card" style="border-color: var(--danger)">
      <p style="color: var(--danger)">{{ store.error }}</p>
    </div>

    <div v-if="store.results" class="grid-2">
      <div class="card">
        <h3>Statistics</h3>
        <div class="stats">
          <div class="stat">
            <span class="stat-label">Sent</span>
            <span class="stat-value">{{ store.results.transmitted }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Received</span>
            <span class="stat-value">{{ store.results.received }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Loss</span>
            <span class="stat-value" :class="{ 'text-danger': store.results.loss > 0 }">
              {{ store.results.loss }}%
            </span>
          </div>
        </div>
      </div>
      <div class="card">
        <h3>Latency</h3>
        <div class="stats">
          <div class="stat">
            <span class="stat-label">Min</span>
            <span class="stat-value">{{ store.results.rtt_min }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Avg</span>
            <span class="stat-value highlight">{{ store.results.rtt_avg }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Max</span>
            <span class="stat-value">{{ store.results.rtt_max }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="store.results?.packets" class="card">
      <h3>Details</h3>
      <div v-for="(pkt, i) in store.results.packets" :key="i" class="packet-line">
        <span>seq={{ pkt.seq }}</span>
        <span :style="{ color: pkt.time ? 'var(--text-primary)' : 'var(--danger)' }">
          {{ pkt.time ? `${pkt.time} ms` : 'Timeout' }}
        </span>
        <span v-if="pkt.ttl">ttl={{ pkt.ttl }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ping-test {
  max-width: 900px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 0.25rem;
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.ping-controls {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.input-group {
  flex: 1;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border);
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.stat-value {
  font-weight: 600;
  font-size: 1.1rem;
}

.stat-value.highlight {
  color: var(--accent);
}

.text-danger {
  color: var(--danger);
}

.packet-line {
  display: flex;
  gap: 1.5rem;
  padding: 0.4rem 0;
  font-family: monospace;
  font-size: 0.9rem;
  border-bottom: 1px solid var(--border);
}

.card h3 {
  margin-bottom: 0.5rem;
}
</style>
