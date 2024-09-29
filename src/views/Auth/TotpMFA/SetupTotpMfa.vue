<template>
  <div class="flex flex-col lg:flex-row justify-center min-h-screen items-center bg-gray-50 p-6">
    <!-- Left Section: Instruction Text -->
    <el-card>
      <div class="flex justify-between p-10">
        <div class="lg:w-1/2 mb-8 lg:mb-0 lg:mr-12">
          <h1 class="text-3xl font-bold mb-4">{{ $t('setup-mfa-page.step-1.title') }}</h1>
          <div class="flex items-start mb-4">
            <span
              class="text-lg font-semibold bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center mr-3"
              >1</span
            >
            <div>
              <h2 class="text-lg font-semibold mb-1">{{ $t('setup-mfa-page.step-1.line-1') }}</h2>
              <p class="text-gray-600">
                {{ $t('setup-mfa-page.step-1.line-2') }}
                <a
                  :href="'https://apps.apple.com/us/app/microsoft-authenticator/id983156458'"
                  class="text-blue-600 underline"
                  >App Store</a
                >
                <span class="mx-1 inline-block"> {{ $t('setup-mfa-page.step-1.or') }} </span>
                <a
                  :href="'https://play.google.com/store/apps/details?id=com.azure.authenticator&hl=vi'"
                  class="text-blue-600 underline"
                  >Google Play Store</a
                >.
              </p>
            </div>
          </div>
        </div>

        <!-- Right Section: Download Buttons -->
        <div class="lg:w-1/2 bg-blue-50 p-6 rounded-md shadow-md">
          <div class="flex flex-col items-center">
            <a href="https://play.google.com/store" target="_blank" class="mb-4 w-[200px] h-[80px]">
              <img src="/images/imgs/googleplay.png" alt="Get it on Google Play" class="h-full" />
            </a>
            <a href="https://apps.apple.com" target="_blank">
              <img
                src="/images/imgs/appstore.png"
                alt="Download on App Store"
                class="h-16 object-cover"
              />
            </a>
          </div>
        </div>
      </div>
      <div class="flex justify-end pr-10">
        <el-button type="info" size="large" class="w-[160px]">{{ $t('button.back') }}</el-button>
        <el-button type="primary" size="large" class="w-[160px]" @click="openTotpCodeForm">{{
          $t('button.I-have-an-app')
        }}</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'SetupAuthenticatorApp',
  data() {
    return {
      query: this.$route.query
    }
  },
  methods: {
    openTotpCodeForm() {
      this.$router.push({ name: 'sso-login-totp-mfa-qrcode', query: this.query})
    }
  }
}
</script>

<style scoped></style>
