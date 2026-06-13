import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSpeedTestStore = defineStore('speedtest', () => {
  const status = ref('ready')
  const results = ref(null)
  const intervals = ref([])
  const error = ref(null)
  const currentSpeed = ref(0)

  let abortController = null

  async function startDownloadTest(ab) {
    abortController = ab
    status.value = 'running'
    error.value = null
    results.value = null
    intervals.value = []
    currentSpeed.value = 0

    try {
      const response = await fetch('/api/speedtest/download?duration=10&size=52428800', {
        signal: ab.signal
      })
      const reader = response.body.getReader()
      const startTime = performance.now()
      const collected = []
      let totalBytes = 0
      let lastSample = startTime

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        totalBytes += value.length
        const now = performance.now()

        if (now - lastSample >= 200) {
          const elapsed = (now - startTime) / 1000
          const avgBps = totalBytes * 8 / elapsed
          collected.push({
            time: Math.round(elapsed * 100) / 100,
            bits_per_second: Math.round(avgBps),
            bytes: totalBytes
          })
          intervals.value = [...collected]
          currentSpeed.value = avgBps
          lastSample = now
        }
      }

      const totalTime = (performance.now() - startTime) / 1000
      const avgBps = totalBytes * 8 / totalTime

      results.value = {
        bandwidth: formatBandwidth(avgBps),
        transfer: formatBytes(totalBytes),
        duration: Math.round(totalTime * 100) / 100,
        intervals: collected
      }
      status.value = 'ready'
    } catch (e) {
      if (e.name === 'AbortError') {
        status.value = 'ready'
        return
      }
      error.value = 'Speed test failed: ' + e.message
      status.value = 'error'
    }
  }

  async function startUploadTest(ab) {
    abortController = ab
    status.value = 'running'
    error.value = null
    results.value = null
    intervals.value = []
    currentSpeed.value = 0

    const size = 50 * 1024 * 1024
    const chunkSize = 256 * 1024
    const data = new Uint8Array(size)
    for (let i = 0; i < data.length; i += chunkSize) {
      data.fill(65, i, Math.min(i + chunkSize, data.length))
    }

    try {
      const startTime = performance.now()
      const collected = []

      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/speedtest/upload')

      const result = await new Promise((resolve, reject) => {
        let lastSample = startTime

        xhr.upload.onprogress = (e) => {
          const now = performance.now()
          if (now - lastSample >= 200) {
            const elapsed = (now - startTime) / 1000
            const avgBps = e.loaded * 8 / elapsed
            collected.push({
              time: Math.round(elapsed * 100) / 100,
              bits_per_second: Math.round(avgBps),
              bytes: e.loaded
            })
            intervals.value = [...collected]
            currentSpeed.value = avgBps
            lastSample = now
          }
        }

        ab.signal.addEventListener('abort', () => {
          xhr.abort()
          reject(new DOMException('Aborted', 'AbortError'))
        })
        xhr.onload = () => {
          if (xhr.status === 200) resolve(JSON.parse(xhr.responseText))
          else reject(new Error(`Upload failed: ${xhr.status}`))
        }
        xhr.onerror = () => reject(new Error('Network error'))
        xhr.setRequestHeader('Content-Type', 'application/octet-stream')
        xhr.send(data)
      })

      intervals.value = collected
      results.value = result
      status.value = 'ready'
    } catch (e) {
      if (e.name === 'AbortError') {
        status.value = 'ready'
        return
      }
      error.value = 'Speed test failed: ' + e.message
      status.value = 'error'
    }
  }

  function cancelTest() {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    status.value = 'ready'
  }

  return {
    status, results, intervals, error, currentSpeed,
    startDownloadTest, startUploadTest, cancelTest
  }
})

function formatBandwidth(bps) {
  if (!bps || !isFinite(bps)) return '0 bps'
  if (bps >= 1e9) return `${(bps / 1e9).toFixed(2)} Gbps`
  if (bps >= 1e6) return `${(bps / 1e6).toFixed(2)} Mbps`
  if (bps >= 1e3) return `${(bps / 1e3).toFixed(2)} Kbps`
  return `${bps.toFixed(2)} bps`
}

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(2)} KB`
  return `${bytes.toFixed(2)} B`
}
