<template>
  <div class="flex items-center min-h-screen bg-grayF5">
    <el-card class="!max-w-[1000px] w-full my-10 mx-auto rounded-lg card-custom">
      <div class="flex items-center mb-8 border-b border-gray">
        <img src="/images/logo-small.png" />
      </div>
      <div class="flex justify-between p-8">
        <div class="w-1/2 flex flex-col gap-5">
          <div class="text-zinc-800 text-[30px] font-bold uppercase leading-[28.80px]">
            {{ $t('auth-page.forgot-password-page.account-recovery') }}
          </div>
          <div class="font-bold">{{ formData.email }}</div>
        </div>
        <div class="px-5 flex-1">
          <el-form
            ref="form"
            :model="formData"
            :rules="rules"
            label-position="top"
            @keypress.enter.prevent="doSubmit"
            class="form-login"
          >
            <el-form-item
              :label="$t('input.otp-code')"
              prop="otp_code"
              :inline-message="hasError('otp_code')"
              :error="getError('otp_code')"
            >
              <el-input
                v-model="formData.otp_code"
                size="large"
                clearable
                :placeholder="$t('input.common.enter', { name: $t('input.otp-code') })"
              />
            </el-form-item>
            <!-- <div class="-mt-2">
              <router-link
                class="text-sm underline cursor-pointer"
                :to="{ name: 'forgot-password' }"
              >
                {{ $t('auth-page.click-forgot-password') }}
              </router-link>
            </div> -->
          </el-form>

          <div class="text-center mt-5">
            <el-button
              type="primary"
              :loading="loadingForm"
              class="w-full mt-3 btn-gradient"
              size="large"
              @click.prevent="doSubmit"
            >
              {{ $t('button.next') }}
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script>
import form from '@/Mixins/form'
import axios from '@/Plugins/ssoAxios.js'
import baseRuleValidate from '@/Store/Const/baseRuleValidate.js'

export default {
  mixins: [form],
  data() {
    return {
      formData: {
        otp_code: null,
        email: this.$route.query.email,
        phone_number: this.$route.query.phone_number,
        token: this.$route.query.token
      },
      rules: {
        otp_code: baseRuleValidate(this.$t)(this.$t('input.otp-code'))
      },
      loadingForm: false,
      errors: null,
      pathSub: window.location.pathname.split('/'),
      query: this.$route.query
    }
  },
  watch: {
    '$page.props.errors': {
      immediate: true,
      handler(value) {
        if (value && Object.keys(value).length > 0) {
          this.$message.error(Object.values(value).join(', '))
        }
      }
    }
  },
  methods: {
    async submit() {
      this.loadingForm = true
      const response = await axios.post('/auth/sso-ucms/password/verify-otp-code', this.formData, {
        params: {
          client_id: this.$route.query.client_id,
          redirect_uri: this.$route.query.redirect_uri
        }
      })
      if (response?.data?.status_code === 200) {
        this.$router.push({ name: 'sso-reset-password', query: {...this.query, token: response?.data?.data?.token} })
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
