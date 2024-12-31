<template>
  <Head title="Two-factor Confirmation" />

  <AuthenticationCard>
    <template #logo>
      <img src="/images/logo.svg" alt="logo" />
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
      @submit.prevent="submit"
    >
      <div v-if="!recovery">
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
      </div>

      <div class="flex flex-col justify-center mt-9 gap-4">
        <el-button
          type="primary"
          :loading="loadingForm"
          @click.prevent="doSubmit"
        >
          {{ $t('button.verify') }}
        </el-button>
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
import baseRuleValidate from '@/Store/Const/baseRuleValidate';

export default {
  mixins: [form],
  components: {
    AuthenticationCard
  },
  data() {
    return {
      recovery: false,
      formData: {
        totpCode: '',
        recovery_code: ''
      },
      query: this.$route.query,
      recoveryCodeInput: null,
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
    async submit() {
      this.loadingForm = true
      const response = await axios.post('/2fa/sso/challenge', {
        ...this.formData,
        ...this.query
      })
      if (response?.data?.status_code === 200) {
        const authTempCode = response?.data?.data
        // Tạo URL với token trong fragment (dấu #)
        const redirectUrl = `${this.query.redirect_uri}#auth_code=${authTempCode}&client_id=${this.query.client_id}&redirect_uri=${encodeURIComponent(this.query.redirect_uri)}`

        // Redirect người dùng về URL mới với access token trong fragment
        window.location.href = redirectUrl
      }
      this.loadingForm = false
    }
  }
}
</script>
