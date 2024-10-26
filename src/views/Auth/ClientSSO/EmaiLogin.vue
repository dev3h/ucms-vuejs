<template>
  <div class="flex items-center min-h-screen bg-grayF5">
    <el-card class="!max-w-[1000px] w-full my-10 mx-auto rounded-lg card-custom">
       <div class="flex items-center mb-8 border-b border-gray">
        <img src="/images/logo-small.png" />
        <span class="text-lg font-semibold">{{ $t('auth-page.ucms-login') }}</span>
      </div>
      <div class="flex justify-between p-8">
        <div class="text-zinc-800 text-[40px] font-bold uppercase leading-[28.80px]">
          {{ $t('auth-page.login-title') }}
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
              :label="$t('input.common.email')"
              prop="email"
              :inline-message="hasError('email')"
              :error="getError('email')"
            >
              <el-input v-model="formData.email" size="large" clearable />
            </el-form-item>
            <div class="-mt-2">
              <router-link
                class="text-sm underline cursor-pointer"
                :to="{ name: 'forgot-password' }"
              >
                {{ $t('auth-page.click-forgot-password') }}
              </router-link>
            </div>
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
        email: null
      },
      rules: {
        email: baseRuleValidate(this.$t)(this.$t('input.common.email'))
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
      const response = await axios.post('/auth/check-email-exist', this.formData, {
        params: {
          client_id: this.$route.query.client_id,
          redirect_uri: this.$route.query.redirect_uri
        }
      })
      if (response?.data?.data) {
        const resData = response?.data?.data
        const query = {
          email: resData?.email,
          session_token: resData?.sessionToken,
          client_id: resData?.client_id,
          redirect_uri: resData?.redirect_uri
        }
        this.$router.push({ name: 'sso-login-password', query })
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
