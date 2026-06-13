<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import ApexCharts from 'apexcharts'

const props = defineProps({
  data: { type: Array, default: () => [] },
  live: Boolean
})

const chartRef = ref(null)
let chart = null

function buildOptions() {
  return {
    chart: {
      type: 'line',
      height: 350,
      toolbar: { show: false },
      background: 'transparent',
      foreColor: '#94a3b8'
    },
    stroke: { width: 2, curve: 'smooth' },
    colors: ['#70c0e8'],
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.1 }
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
    },
    series: [{ name: 'Bandwidth', data: [] }]
  }
}

function toSeries(data) {
  if (!data || data.length === 0) return [{ name: 'Bandwidth', data: [] }]
  return [{
    name: 'Bandwidth',
    data: data.map(d => ({
      x: Math.round(d.time * 100) / 100,
      y: Math.round(d.bits_per_second)
    }))
  }]
}

onMounted(() => {
  chart = new ApexCharts(chartRef.value, buildOptions())
  chart.render().catch(() => {})
})

watch(() => props.data, (val) => {
  if (chart) {
    chart.updateSeries(toSeries(val)).catch(() => {})
  }
}, { deep: true })

onUnmounted(() => {
  if (chart) {
    chart.destroy()
    chart = null
  }
})
</script>

<template>
  <div ref="chartRef" class="chart-wrapper"></div>
</template>

<style scoped>
.chart-wrapper {
  margin-top: 1rem;
}
</style>
