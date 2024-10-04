import axios from '@/Plugins/axios'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const checkRequiredParams = async (to, from, next) => {
  const { redirect_uri, client_id } = to.query
  if (!redirect_uri || !client_id) {
    let message = 'Missing required parameters: '
    if (!client_id) {
      message += 'client_id '
    } else if (!redirect_uri) {
      message += 'redirect_uri '
    }
    next({ name: 'error-login', query: { authError: btoa(message.trim()) } })
  } else {
    try {
      const response = await axios.post('/system/check-data-system', { ...to.query })
      if (response?.data?.data) next()
    } catch (error) {
      next({ name: 'error-login', query: { authError: error.response?.data?.message } })
    }
  }
}

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
              component: () => import('@/views/App/System/Index.vue')
            },
            {
              path: 'system/create',
              name: 'system-create',
              component: () => import('@/views/App/System/Create.vue')
            },
            {
              path: 'system/show/:id',
              name: 'system-show',
              component: () => import('@/views/App/System/Show.vue')
            }
          ]
        },
        {
          path: 'user-management',
          children: [
            {
              path: 'user',
              name: 'user',
              component: () => import('@/views/App/User/Index.vue')
            },
            {
              path: 'user/create',
              name: 'user-create',
              component: () => import('@/views/App/User/Create.vue')
            },
            {
              path: 'user/:id',
              name: 'user-show',
              component: () => import('@/views/App/User/Show.vue')
            }
          ]
        }
      ]
    },
    {
      path: '/sso',
      children: [
        {
          path: 'login/identifier',
          name: 'sso-login-email',
          component: () => import('@/views/Auth/ClientSSO/EmaiLogin.vue'),
          beforeEnter: checkRequiredParams
        },
        {
          path: 'login/challenge/pwd',
          name: 'sso-login-password',
          component: () => import('@/views/Auth/ClientSSO/PasswordLogin.vue'),
          beforeEnter: checkRequiredParams
        },
        {
          path: 'login/oauth/id',
          name: 'sso-login-confirm',
          component: () => import('@/views/Auth/ClientSSO/OauthConfirmLogin.vue'),
          beforeEnter: checkRequiredParams
        },
        {
          path: 'login/setup-totp-mfa',
          name: 'sso-login-setup-totp-mfa',
          component: () => import('@/views/Auth/TotpMFA/SetupTotpMfa.vue')
        },
        {
          path: 'login/totp-mfa-qrcode',
          name: 'sso-login-totp-mfa-qrcode',
          component: () => import('@/views/Auth/TotpMFA/TotpQrcode.vue')
        },
        {
          path: 'login/two-factor-challenge',
          name: 'sso-login-two-factor-challenge',
          component: () => import('@/views/Auth/Page/TwoFactorChallenge.vue')
        },
        {
          path: 'login/error',
          name: 'error-login',
          component: () => import('@/views/Auth/Page/ErrorLogin.vue')
        }
      ]
    },
    {
      path: '/:catchAll(.*)',
      redirect: '/admin/login'
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const adminRoutePattern = /^\/admin\//
  const authRequired = adminRoutePattern.test(to.path)
  const authStore = useAuthStore()
  const loggedIn = authStore.getAdminAccessToken

  if (to.path === '/admin/login' && loggedIn) {
    try {
      await authStore.fetchAdminInfo()
      return next('/admin/system-components/system')
    } catch (error) {
      authStore.clearAdminToken()
      return next()
    }
  }

  if (authRequired && !loggedIn && to.name !== 'admin-login') {
    return next('/admin/login')
  }

  if (loggedIn) {
    try {
      await authStore.fetchAdminInfo()
    } catch (error) {
      authStore.clearAdminToken()
      return next('/admin/login')
    }
  }

  next()
})

export default router
