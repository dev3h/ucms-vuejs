import { createRouter, createWebHistory } from 'vue-router'
import AdminLogin from '../views/Auth/Page/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/admin',
      children: [
        {
          path: 'login',
          name: 'admin-login',
          component: () => AdminLogin
          // component: () => import('../views/AboutView.vue')
        }
      ]


    }
  ]
})

export default router
