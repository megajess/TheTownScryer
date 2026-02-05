import { createRouter, createWebHistory } from 'vue-router'
import GameView from '@/views/GameView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: GameView },
  ],
})

export default router
