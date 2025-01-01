// stores/auth.js
import axios from '@/Plugins/axios'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    adminAccessToken: localStorage.getItem('adminAccessToken') || null,
    adminInfo: null
  }),
  actions: {
    setAdminAccessToken(token) {
      this.adminAccessToken = token
      localStorage.setItem('adminAccessToken', token)
    },
    clearAdminToken() {
      this.adminAccessToken = null
      this.adminInfo = null
      localStorage.removeItem('adminAccessToken')
    },
    // async fetchAdminInfo() {
    //   if (this.adminInfo) {
    //     return this.adminInfo
    //   }
    //   try {
    //     const response = await axios.get('/auth/admin/me', {
    //       headers: {
    //         Authorization: `Bearer ${this.adminAccessToken}`
    //       }
    //     })
    //     this.adminInfo = response?.data?.data
    //     return response?.data?.data
    //   } catch (error) {
    //     console.log(error)
    //     if (
    //       error?.response?.status === 401 &&
    //       error?.response?.data?.errors !== 'INVALID_REFRESH_TOKEN'
    //     ) {
    //       try {
    //         await this.refreshToken()
    //       return this.fetchAdminInfo()
    //       } catch (error) {
    //         this.clearAdminToken()
    //         throw new Error('Session expired. Please log in again.')
    //       }
    //     }
    //     // this.clearAdminToken()
    //   }
    // },
    async fetchAdminInfo() {
      if (!this.adminAccessToken) {
        return null
      }
      if (this.adminInfo) {
        return this.adminInfo
      }
      try {
        const response = await axios.get('/auth/admin/me', {
          headers: {
            Authorization: `Bearer ${this.adminAccessToken}`
          }
        })
        this.adminInfo = response?.data?.data
        return response?.data?.data
      } catch (error) {
        if (error?.response?.status === 401) {
          throw new Error('Invalid token')
        }
        throw error
      }
    },

    async logout() {
      await axios.post('/auth/admin/logout')
      this.clearAdminToken()
    },
    async refreshToken() {
      try {
        const response = await axios.post('/auth/admin/refresh-token')
        const accessToken = response?.data?.access_token
        this.setAdminAccessToken(accessToken)
      } catch (error) {
        // this.clearAdminToken
        throw new Error('Refresh token expired or invalid')
      }
    }
  },
  getters: {
    getAdminAccessToken: (state) => state.adminAccessToken,
    getAdminInfo: (state) => state.adminInfo
  }
})
