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
      type: 'area',
      height: 350,
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
        formatter: v => (v / 1e6).toFixed(1)
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
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
</style>
