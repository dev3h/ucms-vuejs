<template>
  <!-- <Head title="Two-factor Confirmation" /> -->

  <AuthenticationCard>
    <template #logo>
      <img src="/images/logo.svg" alt="logo" width="100" />
    </template>

    <div class="mb-4 text-sm text-center">
      <template v-if="!recovery">
        {{ $t('auth-page.2fa-challenge-page.title') }}
      </template>

      <template v-else>
        {{ $t('auth-page.2fa-challenge-page.title-recovery') }}
      </template>
    </div>

    <el-form
      ref="form"
      :model="formData"
      :rules="rules"
      label-position="top"
      @submit="(e) => e.preventDefault()"
    >
      <div v-if="recovery">
        <el-form-item
          :label="$t('input.recovery-code')"
          prop="recoveryCode"
          :inline-message="hasError('recoveryCode')"
          :error="getError('recoveryCode')"
        >
          <el-input
            id="recoveryCode"
            ref="recoveryCodeInput"
            v-model="formData.recoveryCode"
            type="text"
            class="mt-1 block w-full"
            autocomplete="one-time-code"
          />
        </el-form-item>
      </div>

      <OtpInput
        v-else
        ref="otpPad"
        class="mt-8"
        @enterCodeComplete="handleCode"
        :isDisabled="loadingForm"
      />
      <div>
        <el-button
          v-if="recovery"
          type="primary"
          :loading="loadingForm"
          @click.prevent="handleSubmit"
          class="w-full mt-5"
        >
          {{ $t('button.verify') }}
        </el-button>
        <div
          class="text-sm text-primary hover:text-gray-900 cursor-pointer text-center mt-5"
          @click.prevent="toggleRecovery"
        >
          <template v-if="!recovery">
            {{ $t('button.recovery-code') }}
          </template>
          <template v-else>
            {{ $t('button.auth-code') }}
          </template>
        </div>
      </div>

      <div class="flex justify-center mt-3 gap-1">
        <router-link
          :to="{ name: 'login-setup-totp-mfa' }"
          class="text-sm text-gray-600 hover:text-gray-900 cursor-pointer underline"
        >
          {{ $t('auth-page.2fa-challenge-page.click-here') }}
        </router-link>
        <span class="text-sm text-gray-600">{{
          $t('auth-page.2fa-challenge-page.reset-2fa')
        }}</span>
      </div>
    </el-form>
  </AuthenticationCard>
</template>

<script>
import AuthenticationCard from '@/components/Page/AuthenticationCard.vue'
import axios from '@/Plugins/axios.js'
import form from '@/Mixins/form'
import baseRuleValidate from '@/Store/Const/baseRuleValidate'
import OtpInput from '@/components/Otp/Index.vue'
import { useAuthStore } from '@/stores/auth'
import { ElLoading } from 'element-plus'

export default {
  mixins: [form],
  components: {
    AuthenticationCard,
    OtpInput
  },
  data() {
    return {
      recovery: false,
      formData: {
        totpCode: '',
        recoveryCode: '',
        tempToken: sessionStorage.getItem('tempToken')
      },
      error: '',
      authStore: useAuthStore(),
      recoveryCodeInput: null,
      otpPad: null,
      codeInput: null,
      rules: {
        totpCode: baseRuleValidate(this.$t)(this.$t('column.common.code')),
        recoveryCode: [
          {
            required: true,
            message: this.$t('validate.required'),
            trigger: ['blur', 'change']
          }
        ]
      }
    }
  },
  watch: {
    'formData.totpCode'(newVal) {
      if (newVal && newVal.length === 6) {
        this.handleSubmit()
      }
    }
  },
  methods: {
    async toggleRecovery() {
      this.recovery = !this.recovery

      await this.$nextTick()

      if (this.recovery) {
        this.$refs.recoveryCodeInput.focus()
        this.formData.totpCode = ''
      } else {
        this.$refs.codeInput.focus()
        this.formData.recoveryCode = ''
      }
    },
    handleCode(code) {
      this.formData.totpCode = code
    },
    async handleSubmit() {
      try {
        this.loadingForm = true
        ElLoading.service({ fullscreen: true })
        const response = await axios.post('/2fa/challenge', {
          ...this.formData
        })
        if (response?.data?.status_code === 200) {
          const accessToken = response?.data?.access_token
          this.authStore.setAdminAccessToken(accessToken)
          this.$router.push({ name: 'system' })
        }
        this.loadingForm = false
        ElLoading.service().close()
      } catch (error) {
        console.log(error)
        ElLoading.service().close()
        if (error?.response?.status === 500) {
          this.$message.error(error?.response?.message || this.$t('message.something-wrong'))
        }
        this.loadingForm = false
        if (error?.status === 422) {
          const errorMessage = error?.data?.errors?.totpCode[0]
          this.$refs.otpPad.setErrorMessage(errorMessage)
        }
      }
    }
  }
}
</script>
