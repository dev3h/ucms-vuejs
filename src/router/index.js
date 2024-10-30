import axios from '@/Plugins/axios'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getCookie } from '@/Store/Helper/helpers'

const checkRequiredParams = async (to, from, next) => {
  const { redirect_uri, client_id } = to.query
  if (!redirect_uri || !client_id) {
    let message = 'Missing required parameters: '
    if (!client_id) {
      message += 'client_id '
    } else if (!redirect_uri) {
      message += 'redirect_uri '
    }
    next({ name: 'error-login', query: { authError: encodeURIComponent(message.trim()) } })
  } else {
    try {
      const response = await axios.post('/system/check-data-system', { ...to.query })
      if (response?.data?.data) next()
    } catch (error) {
      next({ name: 'error-login', query: { authError: error.response?.data?.message } })
    }
  }
}

const setDeviceIdentifier = async () => {
  try {
    let deviceId = getCookie('deviceId')
    if (!deviceId) {
      const response = await axios.post('/auth/generate-device-id')
      deviceId = response.data.data
      const domain = window.location.hostname
      setCookie('deviceId', deviceId, 365, domain)
    }
  } catch (error) {
    console.log(error)
  }
}

function setCookie(name, value, days, domain) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; domain=${domain}; Secure; SameSite=None`
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
            // system
            {
              path: 'system',
              name: 'system',
              component: () => import('@/views/App/System/Index.vue')
            },
            {
              path: 'system/create',
              name: 'system-create',
              component: () => import('@/views/App/System/CreateEditForm.vue')
            },
            {
              path: 'system/:id/edit',
              name: 'system-edit',
              component: () => import('@/views/App/System/CreateEditForm.vue')
            },
            {
              path: 'system/show/:id',
              name: 'system-show',
              component: () => import('@/views/App/System/Show.vue')
            },
            {
              path: 'system/test',
              component: () => import('@/views/App/System/Test.vue')
            },
            {
              path: 'system/test1',
              component: () => import('@/views/App/System/Test1.vue')
            },
            // subsystem
            {
              path: 'subsystem',
              name: 'subsystem',
              component: () => import('@/views/App/SubSystem/Index.vue')
            },
            {
              path: 'subsystem/create',
              name: 'subsystem-create',
              component: () => import('@/views/App/SubSystem/CreateEditForm.vue')
            },
            {
              path: 'subsystem/:id/edit',
              name: 'subsystem-edit',
              component: () => import('@/views/App/SubSystem/CreateEditForm.vue')
            },
            {
              path: 'subsystem/show/:id',
              name: 'subsystem-show',
              component: () => import('@/views/App/SubSystem/Show.vue')
            },
            // module
            {
              path: 'module',
              name: 'module',
              component: () => import('@/views/App/Module/Index.vue')
            },
            {
              path: 'module/create',
              name: 'module-create',
              component: () => import('@/views/App/Module/CreateEditForm.vue')
            },
            {
              path: 'module/:id/edit',
              name: 'module-edit',
              component: () => import('@/views/App/Module/CreateEditForm.vue')
            },
            {
              path: 'module/show/:id',
              name: 'module-show',
              component: () => import('@/views/App/Module/Show.vue')
            },
            {
              path: 'action',
              name: 'action',
              component: () => import('@/views/App/Action/Index.vue')
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
              component: () => import('@/views/App/User/CreateEdit.vue')
            },
            {
              path: 'user/:id/edit',
              name: 'user-edit',
              component: () => import('@/views/App/User/CreateEdit.vue')
            },
            {
              path: 'user/:id',
              name: 'user-show',
              component: () => import('@/views/App/User/Show.vue')
            },
            {
              path: 'user/:id/assign-permission',
              name: 'user-assign-permission',
              component: () => import('@/views/App/User/AssignPermission.vue')
            },
            {
              path: 'role',
              name: 'role',
              component: () => import('@/views/App/Role/Index.vue')
            },
            {
              path: 'permission',
              name: 'permission',
              component: () => import('@/views/App/Permission/Index.vue')
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
          path: 'login/account-choose',
          name: 'sso-login-account-choose',
          component: () => import('@/views/Auth/ClientSSO/AccountChoose.vue'),
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

let firstTimeLogin = true

router.beforeEach(async (to, from, next) => {
  const routeName = to?.name
  if (routeName === 'sso-login-email' && firstTimeLogin) {
    let deviceId = getCookie('deviceId')

    if (!deviceId) {
      await setDeviceIdentifier()
    } else {
      const deviceLoginHistories = await axios.get(`/auth/get-device-login-histories/${deviceId}`)
      if (deviceLoginHistories.data.data.length > 0) {
        const { client_id, redirect_uri } = to.query
        firstTimeLogin = false
        return next({ name: 'sso-login-account-choose', query: { client_id, redirect_uri } })
      }
    }
  }

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
