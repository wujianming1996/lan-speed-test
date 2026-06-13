<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const chartOptions = computed(() => ({
  chart: {
    type: 'line',
    height: 350,
    toolbar: { show: false },
    background: 'transparent',
    foreColor: '#94a3b8'
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
    labels: { style: { colors: '#94a3b8' } }
  },
  yaxis: {
    title: { text: 'Bandwidth (Mbps)', style: { color: '#94a3b8' } },
    labels: { style: { colors: '#94a3b8' } }
  },
  grid: {
    borderColor: '#334155'
  },
  tooltip: {
    theme: 'dark',
    style: {
      colors: ['#181818']
    }
  }
}))

const chartSeries = computed(() => [{
  name: 'Bandwidth',
  data: props.data.map(d => ({
    x: d.time,
    y: Math.round(d.bits_per_second / 1000000 * 100) / 100
  }))
}])
</script>

<template>
  <div class="chart-wrapper">
    <VueApexCharts
      :options="chartOptions"
      :series="chartSeries"
      type="line"
      height="350"
    />
  </div>
</template>

<style scoped>
.chart-wrapper {
  margin-top: 1rem;
}
</style>
