import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Dashboard from './views/Dashboard.vue'
import Profile from './views/Profile.vue'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', redirect: '/dashboard' },
  { path: '/dashboard', component: Dashboard },
  { path: '/profile', component: Profile }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const pinia = createPinia()

createApp(App).use(pinia).use(router).mount('#app')
