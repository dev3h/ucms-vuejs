import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/admin',
      children: [
        {
          path: 'login',
          name: 'admin-login',
          component: () => import('@/views/Auth/Page/Login.vue')
        }
      ]
    }
  ]
})

export default router
