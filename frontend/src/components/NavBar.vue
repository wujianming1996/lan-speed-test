<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

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
    </div>
  </nav>
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
</style>
