import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useSpeedTestStore = defineStore('speedtest', () => {
  const servers = ref([])
  const status = ref('ready')
  const results = ref(null)
  const progress = ref(0)
  const error = ref(null)

  async function fetchServers() {
    try {
      const res = await axios.get('/api/servers')
      servers.value = res.data
    } catch (e) {
      error.value = 'Failed to fetch server list'
    }
  }

  async function startSpeedTest(serverId, direction = 'download') {
    status.value = 'running'
    error.value = null
    results.value = null
    progress.value = 0

    try {
      const res = await axios.post('/api/speedtest', {
        server_id: serverId,
        direction,
        duration: 10
      })
      results.value = res.data
      status.value = 'ready'
      progress.value = 100
    } catch (e) {
      error.value = e.response?.data?.error || 'Speed test failed'
      status.value = 'error'
    }
  }

  async function startPing(host, count = 4) {
    status.value = 'running'
    error.value = null
    results.value = null

    try {
      const res = await axios.post('/api/ping', { host, count })
      results.value = res.data
      status.value = 'ready'
    } catch (e) {
      error.value = e.response?.data?.error || 'Ping failed'
      status.value = 'error'
    }
  }

  return { servers, status, results, progress, error, fetchServers, startSpeedTest, startPing }
})
