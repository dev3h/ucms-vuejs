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
                  @input="(value) => filterInput(value, 'password')"
                  :placeholder="$t('input.common.enter', { name: $t('input.common.new-password') })"
                />
                <div v-if="formData.password" class="w-full">
                  <div class="password-strength-bar">
                    <div
                      v-for="n in 4"
                      :key="n"
                      :class="['strength-segment', { active: n <= passwordStrength }]"
                    ></div>
                  </div>
                  <div class="password-strength" :class="passwordStrengthClass">
                    {{ passwordStrengthText }}
                  </div>
                </div>
              </el-form-item>
              <el-form-item
                :label="$t('input.common.confirm-new-password')"
                prop="password_confirmation"
                :inline-message="hasError('password_confirmation')"
                :error="getError('password_confirmation')"
                @input="(value) => filterInput(value, 'password_confirmation')"
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
      </div>
    </el-card>
  </div>
</template>
<script>
import form from '@/Mixins/form'
import axios from '@/Plugins/ssoAxios.js'
import baseRuleValidate from '@/Store/Const/baseRuleValidate.js'
import { filterPasswordInput } from '@/Store/Helper/helpers';
import zxcvbn from 'zxcvbn'

export default {
  mixins: [form],
  data() {
    return {
      formData: {
        phone_number: this.$route.query.phone_number,
        email: this.$route.query.email,
        password: null,
        password_confirmation: null,
        token: this.$route.query.token || ''
      },
      query: this.$route.query,
      rules: {
        password: baseRuleValidate(this.$t)(this.$t('input.common.new-password')),
        password_confirmation: baseRuleValidate(this.$t)(
          this.$t('input.common.confirm-new-password')
        )
      },
      loadingForm: false,
      passwordStrength: 0,
      errors: null,
      pathSub: window.location.pathname.split('/')
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
    '$page.props.errors': {
      immediate: true,
      handler(value) {
        if (value && Object.keys(value).length > 0) {
          this.$message.error(Object.values(value).join(', '))
        }
      }
    },
    'formData.password': function (val) {
      const result = zxcvbn(val)
      this.passwordStrength = result.score
    }
  },
  methods: {
    filterInput(value, field) {
      this.formData[field] = filterPasswordInput(value)
    },
    async submit() {
      this.loadingForm = true
      const response = await axios.post('/auth/sso-ucms/reset-password', this.formData, {
        params: {
          client_id: this.$route.query.client_id,
          redirect_uri: this.$route.query.redirect_uri
        }
      })
      if (response?.data?.status_code === 200) {
        this.$message({
          message: response?.data?.message,
          type: 'success'
        })
        this.$router.push({
          name: 'sso-login-email',
          query: {
            client_id: this.$route.query.client_id,
            redirect_uri: this.$route.query.redirect_uri
          }
        })
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
