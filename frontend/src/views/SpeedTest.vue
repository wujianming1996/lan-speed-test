<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSpeedTestStore } from '../stores/speedtest'
import SpeedChart from '../components/SpeedChart.vue'

const { t } = useI18n()
const store = useSpeedTestStore()
const direction = ref('download')

const canStart = computed(() => store.status === 'ready')
const isRunning = computed(() => store.status === 'running')
const liveSpeed = computed(() => {
  const bps = store.currentSpeed
  if (!bps || !isFinite(bps) || bps <= 0) return { value: '0.00', unit: 'bps' }
  if (bps >= 1e9) return { value: (bps / 1e9).toFixed(2), unit: 'Gbps' }
  if (bps >= 1e6) return { value: (bps / 1e6).toFixed(2), unit: 'Mbps' }
  if (bps >= 1e3) return { value: (bps / 1e3).toFixed(2), unit: 'Kbps' }
  return { value: bps.toFixed(2), unit: 'bps' }
})

function runTest() {
  if (!canStart.value) return
  const ab = new AbortController()
  if (direction.value === 'download') {
    store.startDownloadTest(ab)
  } else {
    store.startUploadTest(ab)
  }
}

function cancel() {
  store.cancelTest()
}
</script>

<template>
  <div class="speedtest">
    <h2>{{ t('speedtest.title') }}</h2>
    <p class="subtitle">{{ t('speedtest.subtitle') }}</p>

    <div class="card">
      <div class="test-controls">
        <div class="control-group">
          <label>{{ t('speedtest.direction') }}</label>
          <div class="direction-toggle">
            <button
              :class="['btn', direction === 'download' ? 'btn-primary' : '']"
              @click="direction = 'download'"
            >
              ⬇ {{ t('speedtest.download') }}
            </button>
            <button
              :class="['btn', direction === 'upload' ? 'btn-primary' : '']"
              @click="direction = 'upload'"
            >
              ⬆ {{ t('speedtest.upload') }}
            </button>
          </div>
        </div>

        <div class="control-group action">
          <button
            v-if="!isRunning"
            class="btn btn-primary"
            :disabled="!canStart"
            @click="runTest"
          >
            🚀 {{ t('speedtest.start') }}
          </button>
          <button
            v-else
            class="btn btn-danger"
            @click="cancel"
          >
            ⏹ {{ t('speedtest.cancel') }}
          </button>
        </div>
      </div>
      <div v-if="isRunning" class="live-speed">
        <span class="speed-value">{{ liveSpeed.value }}</span>
        <span class="speed-unit">{{ liveSpeed.unit }}</span>
      </div>
    </div>

    <div v-if="store.error" class="card" style="border-color: var(--danger)">
      <p style="color: var(--danger)">{{ store.error }}</p>
    </div>

    <div v-if="store.results" class="card">
      <h3>{{ t('speedtest.results') }}</h3>
      <div class="results-grid">
        <div class="result-item">
          <span class="result-label">{{ t('speedtest.bandwidth') }}</span>
          <span class="result-value highlight">{{ store.results.bandwidth }}</span>
        </div>
        <div class="result-item">
          <span class="result-label">{{ t('speedtest.transfer') }}</span>
          <span class="result-value">{{ store.results.transfer }}</span>
        </div>
        <div class="result-item full-width">
          <span class="result-label">{{ t('speedtest.duration') }}</span>
          <span class="result-value">{{ store.results.duration }}s</span>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>{{ t('speedtest.realtime_chart') }}</h3>
      <SpeedChart :data="store.intervals" :live="isRunning" />
    </div>
  </div>
</template>

<style scoped>
.speedtest {
  max-width: 900px;
  margin: 0 auto;
}

.test-controls {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.control-group {
  flex: 1;
  min-width: 200px;
}

.control-group.action {
  flex: 0;
  min-width: auto;
}

.direction-toggle {
  display: flex;
  gap: 0.5rem;
}

.direction-toggle .btn {
  flex: 1;
}

.live-speed {
  margin-top: 1rem;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  justify-content: center;
}

.speed-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.speed-unit {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-left: 0.25rem;
}

.results-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 8px;
}

.result-item.full-width {
  grid-column: 1 / -1;
}

.result-label {
  color: var(--text-secondary);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.result-value {
  font-size: 1.2rem;
  font-weight: 600;
}

.result-value.highlight {
  color: var(--accent);
  font-size: 1.5rem;
}

/* ===== Mobile ===== */
@media (max-width: 768px) {
  .test-controls {
    flex-direction: column;
    gap: 1rem;
  }

  .control-group {
    min-width: 100%;
  }

  .control-group.action {
    width: 100%;
  }

  .control-group.action .btn {
    width: 100%;
  }

  .direction-toggle .btn {
    font-size: 0.85rem;
    padding: 0.6rem 0.8rem;
  }

  .speed-value {
    font-size: 3rem;
  }

  .speed-unit {
    font-size: 1.4rem;
  }

  .results-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .result-item {
    padding: 0.85rem;
  }

  .result-value {
    font-size: 1.1rem;
  }

  .result-value.highlight {
    font-size: 1.3rem;
  }
}

@media (max-width: 375px) {
  .speed-value {
    font-size: 2rem;
  }

  .results-grid {
    grid-template-columns: 1fr;
  }

  .result-item.full-width {
    grid-column: auto;
  }
}
</style>
