import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/admin',
      name: 'admin',
      children: [
        {
          path: 'login',
          name: 'admin-login',
          component: () => import('@/views/Auth/Page/Login.vue')
        },
        {
          path: 'forgot-password',
          name: 'forgot-password',
          component: () => import('@/views/Auth/Page/Password/ForgotPassword.vue')
        },
        {
          path: 'system-components',
          children: [
            {
              path: 'system',
              name: 'system',
              component: () => import('@/views/System/Index.vue')
            },
            {
              path: 'system/create',
              name: 'system-create',
              component: () => import('@/views/System/Create.vue')
            }
          ]
        },
        {
          path: 'user-management',
          children: [
            {
              path: 'user',
              name: 'user',
              component: () => import('@/views/User/Index.vue')
            }
          ]
        }
      ]
    },
    {
      path: '/sso',
      children: [
        {
          path: 'login',
          name: 'sso-login',
          component: () => import('@/views/Auth/Page/Login.vue')
        }
      ]
    },
    {
      path: '/:catchAll(.*)',
      redirect: '/admin/login'
    }
  ]
})

// router.beforeEach((to, from, next) => {
//   // Redirect to login page if not logged in and trying to access a restricted page
//   const publicPages = ['/admin/login', '/sso/login', '/admin/forgot-password']
//   const authRequired = !publicPages.includes(to.path)
//   const loggedIn = localStorage.getItem('user')

//   if (authRequired && !loggedIn) {
//     return next('/admin/login')
//   }

//   next()
// })

export default router
