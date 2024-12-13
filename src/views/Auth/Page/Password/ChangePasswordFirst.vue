<template>
  <div class="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-grayF5">
    <el-card class="!max-w-[500px] w-full py-6 mx-auto">
      <div class="relative">
        <div class="logo flex justify-center mb-6 px-5">
          <img src="/images/logo.svg" alt="logo" class="h-[100px]" />
        </div>
      </div>
      <div class="w-full sm:max-w-md px-6 py-2 overflow-hidden">
        <!-- <p class="text-[20px] font-bold py-3 w-full text-center">
          {{ $t('auth-page.change-password-first-page.title') }}
        </p> -->
        <div class="mt-4 form-change-password">
          <el-form
            ref="form"
            :model="formData"
            :rules="rules"
            label-position="top"
            @keypress.enter="doSubmit"
          >
            <el-form-item
              :label="$t('input.common.old-password')"
              prop="old_password"
              :inline-message="hasError('old_password')"
              :error="getError('old_password')"
            >
              <el-input
                v-model="formData.old_password"
                type="password"
                size="large"
                show-password
                clearable
                :placeholder="$t('input.common.enter', { name: $t('input.common.old-password') })"
              />
            </el-form-item>
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
          <div>
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
    </el-card>
  </div>
</template>
<script>
import form from '@/Mixins/form'
import axios from '@/Plugins/axios'
import baseRuleValidate from '@/Store/Const/baseRuleValidate.js'
import { useAuthStore } from '@/stores/auth'
import zxcvbn from 'zxcvbn'

export default {
  mixins: [form],
  data() {
    return {
      formData: {
        email: this.$route.query.email,
        old_password: null,
        password: null,
        password_confirmation: null
      },
      rules: {
        old_password: baseRuleValidate(this.$t)(this.$t('input.common.old-password')),
        password: baseRuleValidate(this.$t)(this.$t('input.common.password')),
        password_confirmation: baseRuleValidate(this.$t)(
          this.$t('input.common.confirm-new-password')
        )
      },
      authStore: useAuthStore(),
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
      const response = await axios.post('auth/admin/password-update', this.formData)
      this.$message({
        message: response?.data?.message,
        type: response?.data?.status_code === 200 ? 'success' : 'error'
      })
      if(response?.data?.status_code === 200) {
        const accessToken = response?.data?.data?.access_token
        this.authStore.setAdminAccessToken(accessToken)
        this.$router.push({ name: 'system' })
      }
      this.loadingForm = false
    }
  }
}
</script>
<style scoped>
:deep(.form-change-password .el-form-item) {
  margin-bottom: 1.7rem !important;
}
</style>
