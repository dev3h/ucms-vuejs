<template>
  <div class="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-grayF5">
    <el-card class="!max-w-[500px] w-full py-6 mx-auto">
      <div class="relative">
        <div class="logo flex justify-center mb-6 px-5">
          <img src="/images/logo.svg" alt="logo" class="h-[100px]" />
        </div>
      </div>
      <div
        class="text-zinc-800 text-2xl font-bold uppercase leading-[28.80px] text-center mb-[17px]"
      >
        {{ $t('auth-page.reset-password-page.title') }}
      </div>
      <div class="w-full sm:max-w-md px-6 py-4 overflow-hidden">
        <div class="mt-4 form-change-password">
          <el-form
            ref="form"
            :model="formData"
            :rules="rules"
            label-position="top"
            @keypress.enter="doSubmit"
          >
            <el-form-item
              :label="$t('input.common.new-password')"
              prop="password"
              :inline-message="hasError('password')"
              :error="getError('password')"
            >
              <el-input
                v-model="formData.password"
                type="password"
                size="large"
                show-password
                clearable
                :placeholder="$t('input.common.enter', { name: $t('input.common.new-password') })"
              />
              <div v-if="formData.password" class="w-full">
                  <div class="password-strength-bar">
                    <div v-for="n in 4" :key="n" :class="['strength-segment', { active: n <= passwordStrength }]"></div>
                  </div>
                  <div class="password-strength" :class="passwordStrengthClass">{{ passwordStrengthText }}</div>
                </div>
            </el-form-item>
            <el-form-item
              :label="$t('input.common.confirm-new-password')"
              prop="password_confirmation"
              :inline-message="hasError('password_confirmation')"
              :error="getError('password_confirmation')"
            >
              <el-input
                v-model="formData.password_confirmation"
                type="password"
                size="large"
                show-password
                clearable
                :placeholder="
                  $t('input.common.enter', { name: $t('input.common.confirm-new-password') })
                "
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
              {{ $t('button.update') }}
            </el-button>
          </div>
        </div>
      </div>
      <div class="justify-start items-center flex mt-5">
        <router-link
          class="inline-block w-full text-center text-primary text-sm cursor-pointer underline"
          :to="{ name: 'admin-login' }"
        >
          {{ $t('auth-page.return-to-login') }}
        </router-link>
      </div>
    </el-card>
  </div>
</template>
<script>
import form from '@/Mixins/form'
import axios from '@/Plugins/axios'
import baseRuleValidate from '@/Store/Const/baseRuleValidate.js'
import zxcvbn from 'zxcvbn'

export default {
  name: 'ResetPassword',
  mixins: [form],
  data() {
    return {
      formData: {
        email: this.$route.query.email || '',
        password: null,
        password_confirmation: null,
        token: this.$route.query.token || ''
      },
      rules: {
        password: baseRuleValidate(this.$t)(this.$t('input.common.new-password')),
        password_confirmation: baseRuleValidate(this.$t)(
          this.$t('input.common.confirm-new-password')
        )
      },
      loadingForm: false,
      passwordStrength: 0
    }
  },
  computed: {
    passwordStrengthClass() {
      return `strength-${this.passwordStrength}`
    },
    passwordStrengthText() {
            const levels = ['Rất yếu', 'Yếu', 'Trung bình', 'Tốt', 'Mạnh']
      return levels[this.passwordStrength]
    }
  },
  watch: {
    'formData.password': function (val) {
      const result = zxcvbn(val)
      this.passwordStrength = result.score
    }
  },
  methods: {
    async submit() {
      this.loadingForm = true
      const response = await axios.post('/auth/reset-password', this.formData)
      this.$message({
        message: response?.data?.message,
        type: response?.data?.status_code === 200 ? 'success' : 'error'
      })
      this.loadingForm = false
      if (response?.data?.status_code === 200) {
        this.$router.push({ name: 'admin-login' })
      }

      // this.$inertia.visit(this.appRoute("admin.login.form"));
    }
  }
}
</script>
<style scoped>
:deep(.form-change-password .el-form-item) {
  margin-bottom: 1.7rem !important;
}
</style>
