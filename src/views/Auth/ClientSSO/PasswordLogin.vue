<template>
  <div class="flex items-center min-h-screen bg-grayF5 bg-gray-50">
    <el-card class="!max-w-[1000px] w-full my-10 mx-auto rounded-lg p-10">
      <div class="text-blueDark flex justify-between items-center">
        <div class="w-[300px]">
          <div class="relative">
            <div class="logo mb-6">
              <img src="/images/logo.svg" alt="logo" class="h-[100px]" />
            </div>
          </div>
          <div class="text-zinc-800 text-2xl font-bold uppercase leading-[28.80px] mb-2">
            {{ $t('auth-page.welcome-title') }}
          </div>
          <div>
            {{ formData?.email }}
          </div>
        </div>
        <div class="px-5 w-1/2">
          <el-form
            ref="form"
            :model="formData"
            :rules="rules"
            label-position="top"
            @keypress.enter.prevent="doSubmit"
            class="form-login"
          >
            <el-form-item
              :label="$t('input.common.password')"
              prop="password"
              :inline-message="hasError('password')"
              :error="getError('password')"
            >
              <el-input
                v-model="formData.password"
                size="large"
                type="password"
                show-password
                clearable
              />
            </el-form-item>
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
import axios from '@/Plugins/axios.js'
import baseRuleValidate from '@/Store/Const/baseRuleValidate.js'

export default {
  name: 'admin-login',
  mixins: [form],
  data() {
    return {
      formData: {
        email: this.$route.query.email,
        password: null
      },
      query: this.$route.query,
      rules: {
        password: baseRuleValidate(this.$t)
      },
      loadingForm: false,
      errors: null,
      pathSub: window.location.pathname.split('/')
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
      const response = await axios.post('/auth/oauth-ucms/login', this.formData, {
        params: this.query
      })
      if (response?.data?.data) {
        const resData = response?.data?.data
        const query = {
          email: resData?.email,
          consent_token: resData?.consentToken,
          client_id: resData?.client_id,
          redirect_uri: resData?.redirect_uri
        }
        if (resData?.two_factor_enable) {
          if(resData?.is_two_factor_secret) {
            this.$router.push({ name: 'sso-login-two-factor-challenge', query })
          } else {
            this.$router.push({ name: 'sso-login-setup-totp-mfa', query })
          }
        } else {
          this.$router.push({ name: 'sso-login-confirm', query })
        }
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
