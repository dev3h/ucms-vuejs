<template>
  <div class="flex flex-col lg:flex-row justify-center min-h-screen items-center bg-gray-50 p-10">
    <!-- Left Section: Instruction Text -->
    <el-card>
      <div class="flex flex-col lg:flex-row justify-between p-10">
        <div class="lg:w-1/2 mb-8 lg:mb-0 lg:mr-12">
          <h1 class="text-3xl font-bold mb-4">{{ $t('setup-mfa-page.step-1.title') }}</h1>
          <div class="flex items-start mb-4">
            <span
              class="text-lg font-semibold bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center mr-3"
              >2</span
            >
            <div>
              <h2 class="text-lg font-semibold mb-1">{{ $t('setup-mfa-page.step-2.line-1') }}</h2>
              <p class="text-gray-600">{{ $t('setup-mfa-page.step-2.line-2') }}</p>
            </div>
          </div>
          <div class="flex items-start mb-4">
            <span
              class="text-lg font-semibold bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center mr-3"
              >3</span
            >
            <div>
              <h2 class="text-lg font-semibold mb-1">{{ $t('setup-mfa-page.step-3.line-1') }}</h2>
              <p class="text-gray-600">
                {{ $t('setup-mfa-page.step-3.line-2') }}
              </p>
            </div>
          </div>
          <div>
            <el-form ref="form" :model="formData" :rules="rules" label-position="top">
              <el-form-item
                prop="totpCode"
                :inline-message="hasError('totpCode')"
                :error="getError('totpCode')"
              >
                <el-input
                  v-model="formData.totpCode"
                  size="large"
                  :placeholder="$t('input.common.enter', { name: $t('column.common.code') })"
                  clearable
                />
              </el-form-item>
            </el-form>
          </div>
        </div>

        <!-- Right Section: Download Buttons -->
        <div class="flip-card lg:w-1/2">
          <div :class="['flip-card-inner', { flipped: isFlipped }]">
            <!-- Front Content -->
            <div
              class="flip-card-front bg-blue-50 p-6 rounded-md shadow-md flex flex-col items-center gap-3"
            >
              <h4 class="font-bold">{{ $t('setup-mfa-page.step-3.line-3') }}</h4>
              <img :src="qrCode" alt="" class="w-[300px] object-cover" />
              <el-button
                link
                type="primary"
                class="text-blue-400 underline"
                @click="isFlipped = true"
                >{{ $t('setup-mfa-page.step-3.line-4') }}</el-button
              >
            </div>
            <!-- Back Content -->
            <div
              class="flip-card-back bg-blue-50 p-6 rounded-md shadow-md flex flex-col items-center gap-3"
            >
              <p class="font-bold text-center">{{ $t('setup-mfa-page.card-back.line-1') }}</p>
              <p
                v-if="secretCode"
                @click="handleCopyToClipboard(secretCode)"
                class="cursor-pointer hover:opacity-85"
              >
                {{ secretCode }}
              </p>
              <el-button
                link
                type="primary"
                class="text-blue-400 underline"
                @click="isFlipped = false"
                >{{ $t('setup-mfa-page.card-back.view-qr') }}</el-button
              >
            </div>
          </div>
        </div>
      </div>
      <div class="flex justify-end pr-10 mt-[10px]">
        <el-button type="info" size="large" class="w-[160px]" @click="goBack()">{{
          $t('button.back')
        }}</el-button>
        <el-button @click="doSubmit" type="primary" size="large" class="w-[160px]">{{
          $t('button.submit')
        }}</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import axios from '@/Plugins/ssoAxios.js'
import form from '@/Mixins/form'
import baseRuleValidate from '@/Store/Const/baseRuleValidate'

export default {
  mixins: [form],
  data() {
    return {
      qrCode: '',
      secretCode: '',
      query: this.$route.query,
      isAdminRoute: this.$route.path.split('/')[1] === 'admin',
      formData: {
        totpCode: null,
        tempToken: sessionStorage.getItem('tempToken')
      },
      rules: {
        totpCode: baseRuleValidate(this.$t)(this.$t('column.common.code'))
      },
      loadingForm: false,
      isFlipped: false
    }
  },
  created() {
    this.generateTotpQrcode()
  },
  methods: {
    async generateTotpQrcode() {
      try {
        const routeName = this.isAdminRoute ? '/2fa/admin/generate' : '/2fa/sso/generate'
        const data = this.isAdminRoute ? { tempToken: this.formData.tempToken } : this.query
        const response = await axios.post(routeName, data, { responseType: 'arraybuffer' })
        const secretCodeHeader = response.headers['x-secret-code']
        if (secretCodeHeader) {
          this.secretCode = secretCodeHeader
        }
        const blob = new Blob([response.data], { type: 'image/png' })
        this.qrCode = URL.createObjectURL(blob)
      } catch (error) {
        console.log(error)
        let errorMessage = this.$t('message.something-wrong')
        if (error?.response && error?.response?.data) {
          try {
            const text = new TextDecoder().decode(new Uint8Array(error.response.data))
            const json = JSON.parse(text)
            errorMessage = json.message || errorMessage
          } catch (e) {
            this.$message.error(errorMessage)
          }
        }
        this.$message.error(errorMessage)
      }
    },
    async submit() {
      this.loadingForm = true
      const routeName = this.isAdminRoute ? '/2fa/admin/authenticate' : '/2fa/sso/authenticate'
      const response = await axios.post(routeName, {
        ...this.formData,
        ...this.query
      })
      if (response.data?.status_code === 200) {
        if(this.isAdminRoute) {
          this.$message.success(response.data?.message)
        }
        const routeName = this.isAdminRoute ? 'admin-login' : 'sso-login-confirm'
        this.$router.push({ name: routeName, query: this.query })
      } else {
        this.$message.error(response.data?.message || this.$t('message.something-wrong'))
      }
      this.loadingForm = false
    },
    goBack() {
      this.$router.go(-1)
    },
    handleCopyToClipboard(value) {
      navigator.clipboard.writeText(value)
      this.$message({
        type: 'success',
        message: this.$t('message.copy-success')
      })
    }
  }
}
</script>

<style scoped>
.flip-card {
  perspective: 1000px;
  min-height: 420px;
}
.flip-card-inner {
  transition: transform 0.6s;
  transform-style: preserve-3d;
  position: relative;
  height: 100%;
}
.flip-card-inner.flipped {
  transform: rotateY(180deg);
}
.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  backface-visibility: hidden;
}
.flip-card-back {
  transform: rotateY(180deg);
}
</style>
