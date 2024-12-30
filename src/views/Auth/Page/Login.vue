<template>
  <div class="flex items-center min-h-screen bg-grayF5">
    <el-card class="!max-w-[500px] w-full py-5 my-10 mx-auto">
      <div class="w-full flex flex-col">
        <div class="text-blueDark rounded-lg">
          <div class="relative">
            <div class="logo flex justify-center mb-6 px-5">
              <img src="/images/logo.svg" alt="logo" class="h-[100px]" />
            </div>
          </div>
          <div class="px-5">
            <div
              class="text-zinc-800 text-2xl font-bold uppercase leading-[28.80px] text-center mb-9"
            >
              {{ loginTitle }}
            </div>
            <el-form
              ref="form"
              :model="formData"
              :rules="rules"
              label-position="top"
              @keypress.enter.prevent="doSubmit"
              class="form-login"
            >
              <el-form-item
                :label="$t('input.common.email')"
                prop="email"
                :inline-message="hasError('email')"
                :error="getError('email')"
              >
                <el-input
                  v-model="formData.email"
                  size="large"
                  clearable
                  :placeholder="$t('input.common.enter', { name: $t('input.common.email') })"
                />
              </el-form-item>
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

            <div class="text-center">
              <el-button
                type="primary"
                :loading="loadingForm"
                class="w-full mt-3 btn-gradient"
                size="large"
                @click.prevent="doSubmit"
              >
                {{ $t('button.login') }}
              </el-button>
              <div class="mt-4">
                <router-link
                  class="text-sm underline cursor-pointer"
                  :to="{ name: 'forgot-password' }"
                >
                  {{ $t('auth-page.click-forgot-password') }}
                </router-link>
              </div>
            </div>
            <!-- <div class="mt-10" v-if="pathSub?.[1] === 'admin'">
              <h2 class="uppercase text-center font-bold text-xl">{{ $t('auth-page.or') }}</h2>
              <div class="border mt-4">
                <a
                  href=""
                  class="w-full flex h-10 items-center justify-center gap-2 px-4 py-3 hover:bg-gray-50"
                >
                  <img src="/images/logo_google.png" alt="" class="h-8 object-cover" />
                  <span>{{ $t('auth-page.sign-in-with-google') }}</span>
                </a>
              </div>
            </div> -->
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
import axios from '@/Plugins/axios.js'
import baseRuleValidate from '@/Store/Const/baseRuleValidate.js'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'admin-login',
  mixins: [form],
  data() {
    return {
      formData: {
        email: null,
        password: null
      },
      rules: {
        email: baseRuleValidate(this.$t)(this.$t('input.common.email')),
        password: baseRuleValidate(this.$t)(this.$t('input.common.password'))
      },
      loadingForm: false,
      errors: null,
      pathSub: window.location.pathname.split('/'),
      authStore: useAuthStore(),
      countdown: 50,
      countdownActive: false,
      countdownInterval: null
    }
  },
  watch: {
    formErrors: {
      handler(data) {
        if (data?.errors === 'USER_IS_BLOCKED') {
          localStorage.setItem('countdown', +data.remainTime)
          this.countdown = parseInt(+data.remainTime, 10)
          this.startCountdown()
        } else if (data?.errors === 'PASSWORD_EXPIRED') {
          this.$router.push({ name: 'password-update', query: { email: this.formData.email } })
        }
      },
      deep: true
    }
  },
  created() {
    const savedCountdown = localStorage.getItem('countdown')
    if (savedCountdown && savedCountdown > 0) {
      this.countdown = parseInt(savedCountdown, 10)
      this.startCountdown()
    }
  },
  computed: {
    loginTitle() {
      return this.pathSub[1] === 'admin'
        ? this.$t('auth-page.admin-login-title')
        : this.$t('auth-page.login-title')
    }
  },
  methods: {
    async submit() {
      this.loadingForm = true
      const response = await axios.post('/auth/admin/login', this.formData)
      if (response?.data?.data?.firstLogin) {
        // this.$inertia.visit(this.appRoute('admin.first-login.form'))
      } else if (response?.data?.requireTwoFactor) {
        const tempToken = response?.data?.tempToken
        this.authStore.setAdminTempToken(tempToken)
        this.$router.push({ name: 'admin-two-factor' })
        // this.$inertia.visit(this.appRoute('admin.two-factor.form'))
      } else {
        const accessToken = response?.data?.access_token
        this.authStore.setAdminAccessToken(accessToken)
        this.$router.push({ name: 'system' })
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
          localStorage.setItem('countdown', this.countdown)
        } else {
          this.countdownActive = false
          clearInterval(this.countdownInterval)
          localStorage.removeItem('countdown')
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
