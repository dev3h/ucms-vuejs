<template>
  <div class="flex items-center min-h-screen bg-grayF5 bg-gray-50">
    <el-card class="!max-w-[1000px] w-full my-10 mx-auto rounded-lg p-10">
      <div class="text-blueDark flex justify-between">
        <div class="w-[300px]">
          <div class="relative">
            <div class="logo mb-6">
              <img src="/images/logo.svg" alt="logo" class="h-[100px]" />
            </div>
          </div>
          <div class="text-zinc-800 text-2xl font-bold uppercase leading-[28.80px] mb-9">
            {{ $t('auth-page.login-title') }} Hệ thống 1
          </div>
        </div>
        <div class="px-5 w-1/2">
          <div>
            Nếu bạn tiếp tục, UCMS sẽ chia sẻ tên, địa chỉ email, lựa chọn ưu tiên về ngôn ngữ và
            ảnh hồ sơ của bạn với Hệ thống 1
          </div>
        </div>
      </div>
      <div class="flex text-center mt-5">
        <el-button type="info" class="w-full mt-3" size="large">
          {{ $t('button.cancel') }}
        </el-button>
        <el-button
          type="primary"
          :loading="loadingForm"
          class="w-full mt-3"
          size="large"
          @click.prevent="doSubmit"
        >
          {{ $t('button.next') }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>
<script>
import form from '@/Mixins/form'
import axios from '@/Plugins/axios.js'

export default {
  name: 'admin-login',
  mixins: [form],
  data() {
    return {
      loadingForm: false,
      errors: null,
      pathSub: window.location.pathname.split('/')
    }
  },
  methods: {
    async submit() {
      this.loadingForm = true
      const response = await axios.post('/auth/check-email-exist', this.formData)
      if (response?.data?.data) {
        this.$router.push({ name: 'sso-login-password', query: { email: response?.data?.data } })
      }
      this.loadingForm = false
    }
  }
}
</script>
<style>
.form-login .el-form-item {
  margin-bottom: 1.7rem !important;
}
</style>
