<template>
  <div class="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-grayF5">
    <el-card class="!max-w-[700px] w-full py-9 mx-auto">
      <div class="relative">
        <div class="logo flex justify-center mb-6 px-5">
          <img src="/images/logo.svg" alt="logo" class="h-[100px]" />
        </div>
      </div>
      <div class="text-center text-zinc-800 text-2xl font-bold mb-5">
        {{ $t('auth-page.confirm-forgot-password-page.title', { email: formData.email }) }}
      </div>
      <div class="text-center text-neutral-600 text-sm font-normal leading-[21px]">
        <p>{{ $t('auth-page.confirm-forgot-password-page.content') }}</p>
      </div>
      <div class="w-1/2 mx-auto mt-5 px-6 pb-4 overflow-hidden">
        <el-button
          type="primary"
          :loading="loadingForm"
          class="w-full mt-3 btn-gradient"
          size="large"
          @click.prevent="submit"
        >
          {{ $t('button.resend-email') }}
        </el-button>
      </div>
      <div class="justify-center items-center flex mt-5">
        <router-link
          class="text-center text-primary text-sm cursor-pointer underline"
          :to="{ name: 'forgot-password' }"
        >
          {{ $t('auth-page.confirm-forgot-password-page.enter-email-again') }}
        </router-link>
      </div>
    </el-card>
  </div>
</template>
<script>
import form from '@/Mixins/form'
import axios from '@/Plugins/axios'

export default {
  name: 'ConfirmForgotPassword',
  mixins: [form],
  data() {
    return {
      formData: {
        email: this.$route.query.email || ''
      },
      loadingForm: false
    }
  },
  methods: {
    async submit() {
      this.loadingForm = true
      const response = await axios.post('/auth/forgot-password', this.formData)
      this.$message({
        message: response?.data?.message,
        type: response?.data?.status_code === 200 ? 'success' : 'error'
      })
      this.loadingForm = false
    }
  }
}
</script>
<style>
.el-form-item__label {
  font-weight: 900 !important;
}
</style>
