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
      const axiosInstance = axios;
      const response = await axiosInstance.post('auth/sso-ucms/check-info-system', { ...to.query })
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
          path: '/forgot-password',
          name: 'forgot-password',
          component: () => import('@/views/Auth/Page/Password/ForgotPassword.vue')
        },
        {
          path: 'password-update',
          name: 'password-update',
          component: () => import('@/views/Auth/Page/Password/ChangePasswordFirst.vue')
        },
        {
          path: 'confirm-forgot-password',
          name: 'confirm-forgot-password',
          component: () => import('@/views/Auth/Page/Password/ConfirmForgotPassword.vue')
        },
        {
          path: 'reset-password',
          name: 'reset-password',
          component: () => import('@/views/Auth/Page/Password/ResetPassword.vue')
        },
        {
          path: 'login/two-factor-challenge',
          name: 'admin-two-factor',
          component: () => import('@/views/Auth/Page/TwoFactorChallenge.vue')
        },
        {
          path: 'login/setup-totp-mfa',
          name: 'login-setup-totp-mfa',
          component: () => import('@/views/Auth/TotpMFA/SetupTotpMfa.vue')
        },
        {
          path: 'login/totp-mfa-qrcode',
          name: 'login-totp-mfa-qrcode',
          component: () => import('@/views/Auth/TotpMFA/TotpQrcode.vue')
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/App/Dashboard/Index.vue')
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
              component: () => import('@/views/App/User/CreateEditForm.vue')
            },
            {
              path: 'user/:id/edit',
              name: 'user-edit',
              component: () => import('@/views/App/User/CreateEditForm.vue')
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
              path: 'role/create',
              name: 'role-create',
              component: () => import('@/views/App/Role/CreateEditForm.vue')
            },
            {
              path: 'role/:id/edit',
              name: 'role-edit',
              component: () => import('@/views/App/Role/CreateEditForm.vue')
            },
            {
              path: 'role/:id',
              name: 'role-show',
              component: () => import('@/views/App/Role/Show.vue')
            },
            {
              path: 'permission',
              name: 'permission',
              component: () => import('@/views/App/Permission/Index.vue')
            }
          ]
        },
        {
          path: 'audit-log',
          name: 'audit-log',
          component: () => import('@/views/App/AuditLog/Test.vue')
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
          path: 'login/password-update',
          name: 'sso-password-update',
          component: () => import('@/views/Auth/Page/Password/ChangePasswordFirst.vue')
        },
        {
          path: 'login/challenge/pwd',
          name: 'sso-login-password',
          component: () => import('@/views/Auth/ClientSSO/PasswordLogin.vue'),
          beforeEnter: checkRequiredParams
        },
        {
          path: 'forgot-pwd',
          name: 'sso-login-forgot-password',
          component: () => import('@/views/Auth/ClientSSO/ForgotPassword.vue'),
          beforeEnter: checkRequiredParams
        },
        {
          path: 'pwd/verify-code',
          name: 'sso-password-verify-code',
          component: () => import('@/views/Auth/ClientSSO/OtpPassword.vue'),
          beforeEnter: checkRequiredParams
        },
        {
          path: 'pwd/reset-password',
          name: 'sso-reset-password',
          component: () => import('@/views/Auth/ClientSSO/ResetPassword.vue'),
          beforeEnter: checkRequiredParams
        },
        {
          path: 'login/oauth',
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
          component: () => import('@/views/Auth/Page/SSOTwoFactorChallenge.vue')
        },
        {
          path: 'login/error',
          name: 'error-login',
          component: () => import('@/views/Auth/Page/ErrorLogin.vue')
        }
      ]
    },
    {
      path: '/sso/:catchAll(.*)',
      redirect: '/sso/login/error'
    },
    {
      path: '/admin/:catchAll(.*)',
      redirect: '/admin/login'
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
    // let deviceId = getCookie('deviceId')

    // if (!deviceId) {
    //   await setDeviceIdentifier()
    // } else {
      
    // }
    // const deviceLoginHistories = await axios.get(`/auth/get-device-login-histories/${deviceId}`)
    const deviceLoginHistories = await axios.get(`/auth/get-device-login-histories`)
      if (deviceLoginHistories.data.data.length > 0) {
        const { client_id, redirect_uri } = to.query
        firstTimeLogin = false
        return next({ name: 'sso-login-account-choose', query: { client_id, redirect_uri } })
      }
  }

  const adminRoutePattern = /^\/admin\//
  const routeNotRequireAuth = [
    'admin-login',
    'forgot-password',
    'confirm-forgot-password',
    'reset-password',
    'password-update',
    'admin-two-factor',
    'login-totp-mfa-qrcode',
    'login-setup-totp-mfa'
  ]
  const authRequired = adminRoutePattern.test(to.path) && !routeNotRequireAuth.includes(to.name)
  const authStore = useAuthStore()
  const loggedIn = authStore.getAdminAccessToken

  if (authRequired && !loggedIn) {
    // Nếu chưa đăng nhập mà vào route cần auth, chuyển đến trang login
    return next('/admin/login')
  }

  if (adminRoutePattern.test(to.path) && loggedIn) {
    try {
      // Nếu đã đăng nhập, kiểm tra thông tin admin
      await authStore.fetchAdminInfo()
      if (to.name === 'admin-login') {
        // Nếu đã đăng nhập mà đang ở trang login, chuyển đến dashboard
        return next('/admin/system-components/system')
      }
    } catch (error) {
      // Nếu token không hợp lệ, xóa token và chuyển đến trang login
      authStore.clearAdminToken()
      return next('/admin/login')
    }
  }

  // Nếu không có điều kiện nào phù hợp, tiếp tục điều hướng bình thường
  next()
})

export default router

 // if (loggedIn && adminRoutePattern.test(to.path) {
  //   try {
  //     await authStore.fetchAdminInfo()
  //   } catch (error) {
  //     // authStore.clearAdminToken()
  //     return next('/admin/login')
  //   }
  // }
