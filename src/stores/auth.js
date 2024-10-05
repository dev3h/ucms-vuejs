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
    async fetchAdminInfo() {
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
        this.clearAdminToken()
        throw error
      }
    },
    async logout() {
      await axios.post('/auth/admin/logout')
      this.clearAdminToken()
    }
  },
  getters: {
    getAdminAccessToken: (state) => state.adminAccessToken,
    getAdminInfo: (state) => state.adminInfo
  }
})
