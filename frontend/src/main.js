import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import './assets/main.css'

window.addEventListener('unhandledrejection', e => {
  if (e.reason?.code === 403 || e.reason?.name === 'n') e.preventDefault()
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.mount('#app')
