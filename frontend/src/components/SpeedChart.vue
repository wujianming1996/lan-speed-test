<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import ApexCharts from 'apexcharts'

const props = defineProps({
  data: { type: Array, default: () => [] },
  live: Boolean
})

const chartRef = ref(null)
let chart = null
let resizeObserver = null

function getChartHeight() {
  if (window.innerWidth <= 480) return 220
  if (window.innerWidth <= 768) return 260
  return 350
}

function buildOptions() {
  return {
    chart: {
      type: 'area',
      height: getChartHeight(),
      toolbar: { show: false },
      background: '#1e293b',
      foreColor: '#94a3b8',
      animations: { enabled: true, dynamicAnimation: { speed: 200 } }
    },
    stroke: { width: 2, curve: 'smooth', colors: ['#70c0e8'] },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 }
    },
    markers: { size: 0 },
    xaxis: {
      type: 'numeric',
      title: { text: 'Time (s)', style: { color: '#94a3b8', fontSize: '12px' } },
      labels: { style: { colors: '#94a3b8', fontSize: '11px' } },
      min: 0,
      axisBorder: { color: '#334155' },
      axisTicks: { color: '#334155' }
    },
    yaxis: {
      title: { text: 'Mbps', style: { color: '#94a3b8', fontSize: '12px' } },
      labels: {
        style: { colors: '#94a3b8', fontSize: '11px' },
        formatter: v => (v / 1e6).toFixed(1) + ' Mbps'
      },
      axisBorder: { color: '#334155' },
      axisTicks: { color: '#334155' }
    },
    grid: { borderColor: '#334155', strokeDashArray: 3 },
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
      x: d.time,
      y: d.bits_per_second
    }))
  }]
}

function handleResize() {
  if (chart) {
    chart.updateOptions({ chart: { height: getChartHeight() } }, false, false, false).catch(() => {})
  }
}

onMounted(() => {
  chart = new ApexCharts(chartRef.value, buildOptions())
  chart.render().catch(() => {})

  resizeObserver = new ResizeObserver(() => handleResize())
  if (chartRef.value) resizeObserver.observe(chartRef.value)
  window.addEventListener('resize', handleResize)
})

watch(() => props.data, (val) => {
  if (chart) {
    chart.updateSeries(toSeries(val)).catch(() => {})
  }
}, { deep: true })

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (resizeObserver) resizeObserver.disconnect()
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
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

@media (max-width: 768px) {
  .chart-wrapper {
    margin-top: 0.75rem;
  }
}
</style>
