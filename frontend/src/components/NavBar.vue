<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()
const route = useRoute()
const showDonate = ref(false)

const links = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/speedtest', label: 'Speed Test', icon: '⚡' },
  { path: '/ping', label: 'Ping', icon: '📡' }
]
</script>

<template>
  <nav class="navbar">
    <div class="nav-brand" @click="router.push('/')">
      <span class="brand-icon">🌐</span>
      <span class="brand-text">LAN Speed Test</span>
    </div>
    <div class="nav-links">
      <router-link
        v-for="link in links"
        :key="link.path"
        :to="link.path"
        class="nav-link"
        :class="{ active: route.path === link.path }"
      >
        <span class="nav-icon">{{ link.icon }}</span>
        <span>{{ link.label }}</span>
      </router-link>
      <a href="javascript:void(0)" class="nav-link sponsor-link" @click="showDonate = !showDonate">
        <span>☕</span>
        <span>{{ showDonate ? '关闭' : '打赏' }}</span>
      </a>
    </div>
  </nav>
  <div v-if="showDonate" class="donate-overlay" @click="showDonate = false">
    <div class="donate-modal" @click.stop>
      <h3>请我喝杯咖啡 ☕</h3>
      <p>如果这个项目对你有帮助，欢迎打赏支持</p>
      <div class="qr-grid">
        <div class="qr-item">
          <img src="/assets/微信.png" alt="微信支付" />
          <span>微信</span>
        </div>
        <div class="qr-item">
          <img src="/assets/支付宝.jpg" alt="支付宝" />
          <span>支付宝</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: 600;
}

.brand-icon {
  font-size: 1.5rem;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 0.9rem;
  transition: all 0.2s;
}

.nav-link:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.nav-link.active {
  background: rgba(112, 192, 232, 0.1);
  color: var(--accent);
}

.nav-icon {
  font-size: 1.1rem;
}

.sponsor-link {
  color: var(--accent) !important;
}

.donate-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.donate-modal {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  max-width: 480px;
  width: 90%;
}

.donate-modal h3 {
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.donate-modal p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.qr-grid {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.qr-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.qr-item img {
  width: 180px;
  height: 180px;
  border-radius: 8px;
  border: 1px solid var(--border);
}

.qr-item span {
  color: var(--text-secondary);
  font-size: 0.85rem;
}
</style>
