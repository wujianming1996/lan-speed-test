<script setup>
import { ref } from 'vue'

const showDonate = ref(false)
</script>

<template>
  <div class="sponsor">
    <a href="javascript:void(0)" @click="showDonate = !showDonate" class="sponsor-link">
      请我喝杯咖啡 ☕
    </a>
    <div v-if="showDonate" class="donate-qr">
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
.sponsor {
  margin-top: 0.5rem;
}

.sponsor-link {
  color: var(--accent);
  text-decoration: none;
  font-size: 0.85rem;
  cursor: pointer;
}

.sponsor-link:hover {
  text-decoration: underline;
}

.donate-qr {
  margin-top: 1rem;
  padding: 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  text-align: center;
}

.donate-qr p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
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
