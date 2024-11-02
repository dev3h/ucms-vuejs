<template>
  <div class="flex items-center min-h-screen bg-grayF5">
    <el-card class="!max-w-[1000px] w-full my-10 mx-auto rounded-lg card-custom">
      <div class="flex items-center mb-8 border-b border-gray">
        <img src="/images/logo-small.png" />
        <span class="text-lg font-semibold">{{ $t('auth-page.ucms-login') }}</span>
      </div>
      <div class="p-8">
        <div class="flex justify-between">
          <div class="w-1/2">
            <div class="text-zinc-800 text-2xl font-bold uppercase leading-[28.80px] mb-3">
              {{ $t('auth-page.confirm-login-title', { name: decodeURIComponent(query?.sy) }) }}
            </div>
            <div class="flex items-center gap-2">
              <el-avatar size="small">{{ query?.email?.charAt(0) }}</el-avatar> 
              <span>{{ query?.email }}</span>
            </div>
          </div>
          <div class="px-5 flex-1">
            <div>
              {{ $t('sso-ucms-confirm-page.line-1', { name: decodeURIComponent(query?.sy) }) }}
            </div>
          </div>
        </div>
        <div class="flex text-center mt-9">
          <el-button type="info" class="w-full mt-3" size="large" @click="handleCancel">
            {{ $t('button.cancel') }}
          </el-button>
          <el-button
            type="primary"
            :loading="loadingForm"
            class="w-full mt-3"
            size="large"
            @click.prevent="submit"
          >
            {{ $t('button.next') }}
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script>
import axios from '@/Plugins/axios.js'

export default {
  data() {
    return {
      loadingForm: false,
      query: this.$route.query
    }
  },
  methods: {
    async submit() {
      try {
        this.loadingForm = true
        const response = await axios.post('/auth/sso-ucms/confirm', this.query, {
          params: {
            ...this.query
          }
        })
        if (response?.data?.status_code === 200) {
          const authTempCode = response?.data?.data
          // Tạo URL với token trong fragment (dấu #)
          const redirectUrl = `${this.query.redirect_uri}#auth_code=${authTempCode}&client_id=${this.query.client_id}&redirect_uri=${encodeURIComponent(this.query.redirect_uri)}`

          // Redirect người dùng về URL mới với access token trong fragment
          window.location.href = redirectUrl
        }
        this.loadingForm = false
      } catch (err) {
        this.$message.error(err.response.data.message || this.$t('message.something-wrong'))
      }
    },
    handleCancel() {
      const redirectUrl = `${this.query.redirect_uri}?flash_message=${encodeURIComponent(this.$t('message.login-ucms-fail'))}`
      window.location.href = redirectUrl
    },
    handlePopState() {
      this.$router.push({
        name: 'sso-login-email',
        query: {
          client_id: this.query?.client_id,
          redirect_uri: this.query?.redirect_uri
        }
      })
    }
  },
  mounted() {
    window.addEventListener('popstate', this.handlePopState)
  },
  beforeUnmount() {
    window.removeEventListener('popstate', this.handlePopState)
  }
}
</script>
<style>
.form-login .el-form-item {
  margin-bottom: 1.7rem !important;
}
</style>
