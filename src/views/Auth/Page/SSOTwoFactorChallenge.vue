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
            :placeholder="$t('input.common.enter', { name: $t('column.common.code') })"
          />
        </el-form-item>
      </div>

      <div v-else>
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
            clearable
            :placeholder="$t('input.common.enter', { name: $t('input.recovery-code') })"
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
        <div
          class="text-sm text-primary hover:text-gray-900 cursor-pointer text-center"
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
        recoveryCode: ''
      },
      query: this.$route.query,
      recoveryCodeInput: null,
      codeInput: null,
      rules: {
        totpCode: baseRuleValidate(this.$t)(this.$t('column.common.code')),
        recoveryCode: baseRuleValidate(this.$t)(this.$t('input.recovery-code')),
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
