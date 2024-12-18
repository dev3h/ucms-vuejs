import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

/**
 * Axios default config
 */
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
 * @param {Object} options
 * @returns {axios.AxiosInstance}
 */
export function provideAxios(options = {}) {
  const instance = axios.create(Object.assign({}, defaultConfig, options))

  // Setting up axios request interceptor
  instance.interceptors.request.use(
    async function (requestConfig) {
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

export default instance
