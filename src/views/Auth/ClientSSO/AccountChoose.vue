<template>
  <div class="flex items-center min-h-screen bg-grayF5">
    <el-card class="!max-w-[1000px] w-full mx-auto rounded-lg card-custom">
      <div class="flex items-center mb-8 border-b border-gray">
        <img src="/images/logo-small.png" />
        <span class="text-lg font-semibold">{{ $t('auth-page.ucms-login') }}</span>
      </div>
      <div class="flex gap-5 p-8">
        <h2 class="w-1/2 text-[40px] font-bold">
          {{ $t('auth-page.account-choose-page.sub-title') }}
        </h2>
        <div class="flex-1">
          <ul>
            <li
              v-for="account in accounts"
              :key="account.id"
              @click="selectAccount(account)"
              class="flex items-center py-2 cursor-pointer border-b border-gray hover:bg-gray-100 rounded-lg transition"
            >
              <el-avatar size="small" class="mr-4">
                {{ account.name.charAt(0) }}
              </el-avatar>
              <div>
                <p class="font-semibold">{{ account.name }}</p>
                <p class="text-gray-500 text-sm">{{ account.email }}</p>
              </div>
            </li>
          </ul>

          <div class="mt-4">
            <el-button @click="handleOpenAnotherAccountForm()" link type="primary">
              {{ $t('auth-page.account-choose-page.button-another') }}
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script>
import { getCookie } from '@/Store/Helper/helpers'
import axios from '@/Plugins/axios'

export default {
  data() {
    return {
      deviceId: getCookie('deviceId'),
      client_id: this.$route.query.client_id,
      redirect_uri: this.$route.query.redirect_uri,
      accounts: []
    }
  },
  methods: {
    async fetchData() {
      try {
        const response = await axios.get(`/auth/get-device-login-histories/${this.deviceId}`)
        if (response?.data?.status_code === 200) {
          this.accounts = response.data.data
        }
      } catch (err) {
        this.$message.error(err.response.data.message || this.$t('message.something-wrong'))
      }
    },
    async selectAccount(account) {
      try {
        const response = await axios.post('/auth/check-account-device-history', {
          device_id: this.deviceId,
          client_id: this.client_id,
          redirect_uri: this.redirect_uri,
          email: account.email
        })
        if (response?.data?.status_code === 200) {
          const authTempCode = response?.data?.data
          // Tạo URL với token trong fragment (dấu #)
          const redirectUrl = `${this.redirect_uri}#auth_code=${authTempCode}&client_id=${this.client_id}&redirect_uri=${encodeURIComponent(this.redirect_uri)}`

          // Redirect người dùng về URL mới với access token trong fragment
          window.location.href = redirectUrl
        }
      } catch (err) {
        this.$router.push({
          name: 'sso-login-email',
          query: {
            client_id: this.client_id,
            redirect_uri: this.redirect_uri,
            email: account.email
          }
        })
      }
    },
    handleOpenAnotherAccountForm() {
      return this.$router.push({
        name: 'sso-login-email',
        query: {
          client_id: this.client_id,
          redirect_uri: this.redirect_uri
        }
      })
    }
  },
  mounted() {
    this.fetchData()
  }
}
</script>
