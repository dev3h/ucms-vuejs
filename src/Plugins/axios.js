import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

/**
 * Axios default config
 */
// axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
// axios.defaults.headers.common['X-CSRF-TOKEN'] = document
//   .querySelector('meta[name="csrf-token"]')
//   .getAttribute('content')

export const defaultConfig = {
  baseURL:
    import.meta.env.VITE_ENV === 'production'
      ? import.meta.env.VITE_PROD_API_BACKEND
      : import.meta.env.VITE_API_BACKEND,
  timeout: 60000,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
  responseType: 'json',
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN'
}

/**
 * Flag to prevent fetching CSRF token multiple times
 */
let isFetchingCsrfToken = false

/**
 * Fetch CSRF Token and set it globally
 */
async function fetchCsrfTokenIfNeeded(instance) {
  // If CSRF token is not set and it's not being fetched
  if (!instance.defaults.headers.common['X-CSRF-Token'] && !isFetchingCsrfToken) {
    isFetchingCsrfToken = true // Set flag to indicate token is being fetched

    try {
      const response = await instance.get('/csrf/token', { withCredentials: true })
      instance.defaults.headers.common['X-CSRF-Token'] = response.data.csrfToken
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error)
    } finally {
      isFetchingCsrfToken = false // Reset flag once token is fetched or failed
    }
  }
}

/**
 * @param {Object} options
 * @returns {axios.AxiosInstance}
 */
export function provideAxios(options = {}) {
  const instance = axios.create(Object.assign({}, defaultConfig, options))

  // Flags to handle token refresh logic
  let isRefreshing = false
  let failedQueue = []

  const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error)
      } else {
        prom.resolve(token)
      }
    })
    failedQueue = []
  }

  // Setting up axios request interceptor
  instance.interceptors.request.use(
    async function (requestConfig) {
      const authStore = useAuthStore()
      const adminToken = authStore.getAdminAccessToken

      // If token exists, set Authorization header
      if (adminToken) {
        requestConfig.headers['Authorization'] = `Bearer ${adminToken}`
      }

      // Ensure CSRF token is present
      // await fetchCsrfTokenIfNeeded(instance)

      requestConfig.headers['Accept-Language'] = 'vi'
      return requestConfig
    },
    function (error) {
      return Promise.reject(error)
    }
  )

  // Setting up axios response interceptor
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const authStore = useAuthStore()
      const originalRequest = error.config
      // Handle 401 error (unauthorized)
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        error.response?.data?.errors !== 'INVALID_REFRESH_TOKEN'
      ) {
        if (isRefreshing) {
          // Add failed request to queue while refreshing token
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then((token) => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`
              return instance(originalRequest)
            })
            .catch((err) => Promise.reject(err))
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          // Refresh token and retry the original request
          await authStore.refreshToken()
          processQueue(null, authStore.getAdminAccessToken)
          originalRequest.headers['Authorization'] = `Bearer ${authStore.getAdminAccessToken}`
          return instance(originalRequest)
        } catch (err) {
          processQueue(err, null)
          authStore.clearAdminToken()
          return Promise.reject(err)
        } finally {
          isRefreshing = false
        }
      }

      // Handle other error statuses
      if ([422, 302].includes(error.response?.status)) {
        return Promise.reject(error.response)
      }
      if ([503, 404, 403].includes(error.response?.status)) {
        // Optional: Redirect to error pages
        // window.location.href = `/error?status=${error.response.status}`
      }

      return Promise.reject(error)
    }
  )

  return instance
}

/**
 * Vue Axios Plugin
 */
export const VueAxios = {
  installed: false,

  install(Vue, instance = null) {
    if (this.installed) {
      return
    }
    this.installed = true

    Vue.http = instance

    Object.defineProperty(Vue.prototype, '$http', {
      get() {
        return Vue.$http
      }
    })
  }
}

const instance = provideAxios()
// fetchCsrfTokenIfNeeded(instance)

export default instance
