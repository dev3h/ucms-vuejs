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
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
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

  // Setting up axios request interceptor
  instance.interceptors.request.use(
    async function (requestConfig) {
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
      if (error.response.status === 500) {
        return Promise.reject(error)
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
