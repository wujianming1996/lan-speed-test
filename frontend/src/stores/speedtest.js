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
      const size = 50 * 1024 * 1024
      const response = await fetch(`/api/speedtest/download?size=${size}&duration=10`, {
        signal: ab.signal
      })
      const reader = response.body.getReader()
      let lastTime = performance.now()
      let lastBytes = 0
      let totalBytes = 0
      const startTime = performance.now()
      const collected = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        totalBytes += value.length
        const now = performance.now()
        const elapsed = (now - lastTime) / 1000

        if (elapsed >= 0.2) {
          const speedBps = (value.length * 8) / elapsed
          const point = {
            time: (now - startTime) / 1000,
            bits_per_second: speedBps,
            bytes: totalBytes
          }
          collected.push(point)
          intervals.value = [...collected]
          currentSpeed.value = speedBps
          lastTime = now
          lastBytes = totalBytes
        }
      }

      const totalTime = (performance.now() - startTime) / 1000
      const avgBps = totalBytes * 8 / totalTime

      results.value = {
        bandwidth: formatBandwidth(avgBps),
        transfer: formatBytes(totalBytes),
        duration: Math.round(totalTime * 100) / 100,
        retransmits: 0,
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

    try {
      const size = 50 * 1024 * 1024
      const chunk = new Uint8Array(256 * 1024)
      crypto.getRandomValues(chunk)

      const startTime = performance.now()
      const collected = []
      let totalSent = 0
      let lastTime = performance.now()

      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/speedtest/upload')
      xhr.setRequestHeader('Content-Type', 'application/octet-stream')
      xhr.setRequestHeader('Content-Length', size)

      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText))
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`))
          }
        }
        xhr.onerror = () => reject(new Error('Upload failed'))

        let sent = 0
        function sendNext() {
          if (ab.signal.aborted) {
            xhr.abort()
            reject(new DOMException('Aborted', 'AbortError'))
            return
          }
          if (sent >= size) {
            xhr.send()
            return
          }
          const remaining = size - sent
          const sendSize = Math.min(chunk.length, remaining)
          const now = performance.now()
          const elapsed = (now - lastTime) / 1000

          if (elapsed >= 0.2) {
            const speedBps = (sendSize * 8) / elapsed
            collected.push({
              time: (now - startTime) / 1000,
              bits_per_second: speedBps,
              bytes: sent + sendSize
            })
            intervals.value = [...collected]
            currentSpeed.value = speedBps
            lastTime = now
          }

          sent += sendSize
          xhr.send(chunk.subarray(0, sendSize))
        }

        ab.signal.addEventListener('abort', () => {
          xhr.abort()
          reject(new DOMException('Aborted', 'AbortError'))
        })

        sendNext()
      })

      const data = await uploadPromise
      intervals.value = data.intervals || collected
      results.value = {
        bandwidth: data.bandwidth || formatBandwidth(size * 8 / ((performance.now() - startTime) / 1000)),
        transfer: data.transfer || formatBytes(size),
        duration: data.duration || Math.round((performance.now() - startTime) / 1000),
        intervals: data.intervals || collected
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
