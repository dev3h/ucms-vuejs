// stores/auth.js
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    userAccessToken: localStorage.getItem('userAccessToken') || null,
    adminAccessToken: localStorage.getItem('adminAccessToken') || null
  }),
  actions: {
    setUserAccessToken(token) {
      this.userAccessToken = token
      localStorage.setItem('userAccessToken', token)
    },
    setAdminAccessToken(token) {
      this.adminAccessToken = token
      localStorage.setItem('adminAccessToken', token)
    },
    clearTokens() {
      this.userAccessToken = null
      this.adminAccessToken = null
      localStorage.removeItem('userAccessToken')
      localStorage.removeItem('adminAccessToken')
    }
  },
  getters: {
    getUserAccessToken: state => state.userAccessToken,
    getAdminAccessToken: state => state.adminAccessToken
  }
})