<script setup>
import { computed, watch, ref } from 'vue'
import VueApexCharts from 'vue-apexcharts'

const props = defineProps({
  data: { type: Array, default: () => [] },
  live: Boolean
})

const chartKey = ref(0)

watch(() => props.data?.length, () => {
  if (props.live) chartKey.value++
})

const chartOptions = computed(() => ({
  chart: {
    id: 'realtime-speed',
    type: 'line',
    height: 350,
    toolbar: { show: false },
    background: 'transparent',
    foreColor: '#94a3b8',
    animations: {
      enabled: props.live,
      dynamicAnimation: {
        speed: 200
      }
    }
  },
  stroke: {
    width: 2,
    curve: 'smooth'
  },
  colors: ['#70c0e8'],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.3,
      opacityTo: 0.1
    }
  },
  xaxis: {
    type: 'numeric',
    title: { text: 'Time (s)', style: { color: '#94a3b8' } },
    labels: { style: { colors: '#94a3b8' } },
    min: 0
  },
  yaxis: {
    title: { text: 'Bandwidth (Mbps)', style: { color: '#94a3b8' } },
    labels: {
      style: { colors: '#94a3b8' },
      formatter: v => (v / 1e6).toFixed(1)
    }
  },
  grid: { borderColor: '#334155' },
  tooltip: {
    theme: 'dark',
    x: { formatter: v => v + 's' },
    y: { formatter: v => (v / 1e6).toFixed(2) + ' Mbps' }
  }
}))

const chartSeries = computed(() => [{
  name: 'Bandwidth',
  data: props.data.map(d => ({
    x: Math.round(d.time * 100) / 100,
    y: Math.round(d.bits_per_second)
  }))
}])
</script>

<template>
  <div class="chart-wrapper">
    <VueApexCharts
      :key="chartKey"
      :options="chartOptions"
      :series="chartSeries"
      type="line"
      height="350"
    />
    <div v-if="live && data.length === 0" class="chart-waiting">
      Test running, waiting for data...
    </div>
  </div>
</template>

<style scoped>
.chart-wrapper {
  margin-top: 1rem;
  position: relative;
}

.chart-waiting {
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem;
}
</style>
