<template>
  <div class="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-grayF5">
    <el-card class="!max-w-[500px] w-full py-9 my-10 mx-auto">
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
              />
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
      <div class="h-[21px] justify-start items-center inline-flex mt-[21px]">
        <router-link
          class="text-center text-zinc-800 text-sm font-bold leading-[21px] cursor-pointer underline"
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
      loadingForm: false
    }
  },
  methods: {
    async submit() {
      this.loadingForm = true
      const response = await axios.post('/reset-password', this.formData)
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
