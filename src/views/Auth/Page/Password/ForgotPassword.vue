<template>
  <div class="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-grayF5">
    <el-card class="!max-w-[500px] w-full py-9 my-10 mx-auto">
      <div class="relative">
        <div class="logo flex justify-center mb-6 px-5">
          <img src="/images/logo.svg" alt="logo" class="h-[100px]" />
        </div>
      </div>
      <h2 class="text-zinc-800 text-2xl font-bold uppercase pb-5 text-center">
        {{ $t('auth-page.forgot-password-page.title') }}
      </h2>
      <h4 class="text-center text-sm">{{ $t('auth-page.forgot-password-page.sub-title') }}</h4>
      <div class="w-full sm:max-w-md mt-6 px-6 py-4 overflow-hidden">
        <el-form
          ref="form"
          :model="formData"
          :rules="rules"
          label-position="top"
          @keypress.enter="doSubmit"
        >
          <el-form-item
            :label="$t('input.common.email')"
            prop="email"
            :inline-message="hasError('email')"
            :error="getError('email')"
          >
            <el-input
              v-model="formData.email"
              type="email"
              size="large"
              clearable
              :placeholder="$t('input.common.enter', { name: $t('input.common.email') })"
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
            {{ $t('button.send') }}
          </el-button>
        </div>
      </div>
      <router-link
        class="text-center text-primary text-sm w-full cursor-pointer underline inline-block"
        :to="{ name: 'admin-login' }"
      >
        {{ $t('auth-page.return-to-login') }}
      </router-link>
    </el-card>
  </div>
</template>
<script>
import form from '@/Mixins/form'
import axios from '@/Plugins/axios'
import baseRuleValidate from '@/Store/Const/baseRuleValidate'

export default {
  mixins: [form],
  data() {
    return {
      formData: {
        email: null
      },
      rules: {
        email: baseRuleValidate(this.$t)(this.$t('input.common.email'))
      },
      loadingForm: false
    }
  },
  methods: {
    async submit() {
      this.loadingForm = true
      const response = await axios.post('/auth/forgot-password', this.formData)
      this.$message({ 
        message: response?.data?.message, 
        type: response?.data?.status_code === 200 ? 'success' : 'error'
      })
      this.loadingForm = false
      if(response?.data?.status_code === 200) {
        this.$router.push({
          name: 'confirm-forgot-password',
          query: {
            email: this.formData.email
          }
        })
      }
      // this.$inertia.visit(
      //     this.appRoute("admin.form-confirm-forgot-password", {
      //         email: this.formData.email,
      //     })
      // );
    }
  }
}
</script>
