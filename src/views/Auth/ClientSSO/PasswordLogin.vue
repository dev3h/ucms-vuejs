<template>
  <div class="flex items-center min-h-screen bg-grayF5">
    <el-card class="!max-w-[1000px] w-full my-10 mx-auto rounded-lg card-custom">
      <div class="flex items-center mb-8 border-b border-gray">
        <img src="/images/logo-small.png" />
        <span class="text-lg font-semibold">{{ $t('auth-page.ucms-login') }}</span>
      </div>
      <div class="flex justify-between p-8">
        <div>
          <div class="text-zinc-800 text-[40px] font-bold uppercase leading-[28.80px] mb-2">
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
                :placeholder="$t('input.common.enter', { name: $t('input.common.password') })"
              />
            </el-form-item>
          </el-form>

          <div class="flex items-center mt-5">
            <router-link
              class="flex-1 inline-block h-full text-primary hover:opacity-80"
              :to="{ name: 'sso-login-forgot-password', query }"
            >
              {{ $t('auth-page.forgot-password') }}
            </router-link>
            <el-button
              type="primary"
              :loading="loadingForm"
              class="flex-1 btn-gradient"
              size="large"
              @click.prevent="doSubmit"
            >
              {{ $t('button.next') }}
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
    <el-dialog
      v-model="countdownActive"
      :before-close="handleBeforeClose"
      :show-close="false"
      class="h-1/2 dialog-block-user"
    >
      <div class="flex flex-col justify-center items-center h-full gap-6">
        <p class="text-xl text-center font-bold">{{ $t('message.block-user') }}</p>
        <p class="text-2xl text-center font-bold text-black">
          {{ $t('message.block-user-time', { time: countdown }) }}
        </p>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import form from '@/Mixins/form'
import axios from '@/Plugins/ssoAxios.js'
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
        password: baseRuleValidate(this.$t)(this.$t('input.common.password'))
      },
      loadingForm: false,
      errors: null,
      pathSub: window.location.pathname.split('/'),
      countdown: 50,
      countdownActive: false,
      countdownInterval: null
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
    },
    formErrors: {
      handler(data) {
        if (data?.errors === 'USER_IS_BLOCKED') {
          localStorage.setItem('block_countdown', +data.remainTime)
          this.countdown = parseInt(+data.remainTime, 10)
          this.startCountdown()
        } else if (data?.errors === 'PASSWORD_EXPIRED') {
          this.$router.push({ name: 'sso-password-update', query: this.query })
        }
      },
      deep: true
    }
  },
  created() {
    const savedCountdown = localStorage.getItem('block_countdown')
    if (savedCountdown && savedCountdown > 0) {
      this.countdown = parseInt(savedCountdown, 10)
      this.startCountdown()
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
          redirect_uri: resData?.redirect_uri,
        }
        const twoFactor = resData?.two_factor
        if (twoFactor?.enable) {
          if (twoFactor?.is_secret_token && twoFactor?.is_confirmed) {
            this.$router.push({ name: 'sso-login-two-factor-challenge', query })
          } else {
            this.$router.push({ name: 'sso-login-setup-totp-mfa', query })
          }
        } else {
          this.$router.push({ name: 'sso-login-confirm', query })
        }
      }
      this.loadingForm = false
    },
    startCountdown() {
      this.countdownActive = true
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval)
      }
      this.countdownInterval = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--
          localStorage.setItem('block_countdown', this.countdown)
        } else {
          this.countdownActive = false
          clearInterval(this.countdownInterval)
          localStorage.removeItem('block_countdown')
        }
      }, 1000)
    },
    handleBeforeClose(done) {
      if (this.countdown > 0) {
        return
      } else {
        done()
      }
    }
  }
}
</script>
<style>
.form-login .el-form-item {
  margin-bottom: 1.7rem !important;
}
.dialog-block-user .el-dialog__body {
  height: 100% !important;
}
</style>
