<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import Sponsor from '../components/Sponsor.vue'

const { t } = useI18n()
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
      <h1>{{ t('home.title') }}</h1>
      <p>{{ t('home.subtitle') }}</p>
      <div class="hero-actions">
        <button class="btn btn-primary" @click="router.push('/speedtest')">
          ⚡ {{ t('home.start_speedtest') }}
        </button>
        <button class="btn btn-primary" @click="router.push('/ping')">
          📡 {{ t('home.start_ping') }}
        </button>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <h3>{{ t('home.quick_start') }}</h3>
        <ol class="steps">
          <li>{{ t('home.quick_start_step1') }}</li>
          <li>{{ t('home.quick_start_step2') }}</li>
          <li>{{ t('home.quick_start_step3') }}</li>
          <li>{{ t('home.quick_start_step4') }}</li>
        </ol>
      </div>

      <div class="card">
        <h3>{{ t('home.server_status') }}</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">{{ t('home.status') }}</span>
            <span class="info-value">
              <span class="status-badge ready">● {{ t('home.online') }}</span>
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ t('home.connections') }}</span>
            <span class="info-value">{{ stats.connections || 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="card sponsor-card">
      <Sponsor />
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

.sponsor-card {
  text-align: center;
  padding: 1rem;
}
</style>
