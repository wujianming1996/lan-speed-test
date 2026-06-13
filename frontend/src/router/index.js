import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/speedtest',
    name: 'SpeedTest',
    component: () => import('../views/SpeedTest.vue')
  },
  {
    path: '/ping',
    name: 'Ping',
    component: () => import('../views/PingTest.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
