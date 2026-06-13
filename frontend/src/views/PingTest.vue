<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSpeedTestStore } from '../stores/speedtest'

const { t } = useI18n()
const store = useSpeedTestStore()
const targetHost = ref('')

async function runPing() {
  if (!targetHost.value || store.status === 'running') return
  await store.startPing(targetHost.value)
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
            @keyup.enter="runPing"
          />
        </div>
        <button
          class="btn btn-primary"
          :disabled="!targetHost || store.status === 'running'"
          @click="runPing"
        >
          {{ store.status === 'running' ? '⏳ ' + t('ping.pinging') : '📡 ' + t('ping.ping') }}
        </button>
      </div>
    </div>

    <div v-if="store.error" class="card" style="border-color: var(--danger)">
      <p style="color: var(--danger)">{{ store.error }}</p>
    </div>

    <div v-if="store.results" class="grid-2">
      <div class="card">
        <h3>{{ t('ping.statistics') }}</h3>
        <div class="stats">
          <div class="stat">
            <span class="stat-label">{{ t('ping.sent') }}</span>
            <span class="stat-value">{{ store.results.transmitted }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">{{ t('ping.received') }}</span>
            <span class="stat-value">{{ store.results.received }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">{{ t('ping.loss') }}</span>
            <span class="stat-value" :class="{ 'text-danger': store.results.loss > 0 }">
              {{ store.results.loss }}%
            </span>
          </div>
        </div>
      </div>
      <div class="card">
        <h3>{{ t('ping.latency') }}</h3>
        <div class="stats">
          <div class="stat">
            <span class="stat-label">{{ t('ping.min') }}</span>
            <span class="stat-value">{{ store.results.rtt_min }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">{{ t('ping.avg') }}</span>
            <span class="stat-value highlight">{{ store.results.rtt_avg }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">{{ t('ping.max') }}</span>
            <span class="stat-value">{{ store.results.rtt_max }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="store.results?.packets" class="card">
      <h3>{{ t('ping.details') }}</h3>
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
