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
      <!-- <div v-if="!recovery">
        <el-form-item
          :label="$t('column.common.code')"
          prop="totpCode"
          :inline-message="hasError('totpCode')"
          :error="getError('totpCode')"
        >
          <el-input
            id="code"
            ref="codeInput"
            v-model="formData.totpCode"
            type="text"
            inputmode="numeric"
            class="mt-1 block w-full"
            autofocus
            autocomplete="one-time-code"
            clearable
          />
        </el-form-item>
      </div>

      <div v-else>
        <el-form-item
          label="Recovery Code"
          prop="recovery_code"
          :inline-message="hasError('recovery_code')"
          :error="getError('recovery_code')"
        >
          <el-input
            id="recovery_code"
            ref="recoveryCodeInput"
            v-model="formData.recovery_code"
            type="text"
            class="mt-1 block w-full"
            autocomplete="one-time-code"
          />
        </el-form-item>
      </div> -->

      <OtpInput ref="otpPad" class="mt-8" @enterCodeComplete="handleCode" />

      <div class="flex justify-center mt-9 gap-1">
        <router-link
          :to="{ name: 'login-setup-totp-mfa' }"
          class="text-sm text-gray-600 hover:text-gray-900 cursor-pointer underline"
        >
          {{ $t('auth-page.2fa-challenge-page.click-here') }}
        </router-link>
        <span class="text-sm text-gray-600">{{
          $t('auth-page.2fa-challenge-page.reset-2fa')
        }}</span>
        <!-- <el-button type="primary" :loading="loadingForm" @click.prevent="doSubmit">
          {{ $t('button.verify') }}
        </el-button> -->
        <!-- <el-button
          class="text-sm text-gray-600 hover:text-gray-900 cursor-pointer !ml-0"
          @click.prevent="toggleRecovery"
        >
          <template v-if="!recovery">
            {{ $t('button.recovery-code') }}
          </template>
          <template v-else>
            {{ $t('button.auth-code') }}
          </template>
        </el-button> -->
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
        recovery_code: '',
        tempToken: sessionStorage.getItem('tempToken')
      },
      error: '',
      authStore: useAuthStore(),
      recoveryCodeInput: null,
      otpPad: null,
      codeInput: null,
      rules: {
        totpCode: baseRuleValidate(this.$t)(this.$t('column.common.code')),
        recovery_code: [
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
        this.ok()
      }
    }
  },
  methods: {
    async toggleRecovery() {
      this.recovery = !this.recovery

      await this.$nextTick()

      if (this.recovery) {
        this.$refs.recoveryCodeInput.focus()
        this.form.totpCode = ''
      } else {
        this.$refs.codeInput.focus()
        this.form.recovery_code = ''
      }
    },
    handleCode(code) {
      this.formData.totpCode = code
    },
    async ok() {
      try {
        this.loadingForm = true
        const response = await axios.post('/2fa/challenge', {
          ...this.formData
        })
        console.log(response)
        if (response?.data?.status_code === 200) {
          const accessToken = response?.data?.access_token
          this.authStore.setAdminAccessToken(accessToken)
          this.$router.push({ name: 'system' })
        }
        this.loadingForm = false
      } catch (error) {
        console.log(error)
        if(error?.response?.status === 500) {
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
