<template>
  <div class="flex flex-col lg:flex-row justify-center min-h-screen items-center bg-gray-50 p-10">
    <!-- Left Section: Instruction Text -->
    <el-card>
      <div class="flex justify-between p-10">
        <div class="lg:w-1/2 mb-8 lg:mb-0 lg:mr-12">
          <h1 class="text-3xl font-bold mb-4">{{ $t('setup-mfa-page.step-1.title') }}</h1>
          <div class="flex items-start mb-4">
            <span
              class="text-lg font-semibold bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center mr-3"
              >2</span
            >
            <div>
              <h2 class="text-lg font-semibold mb-1">{{ $t('setup-mfa-page.step-2.line-1') }}</h2>
              <p class="text-gray-600">{{ $t('setup-mfa-page.step-2.line-2') }}</p>
            </div>
          </div>
          <div class="flex items-start mb-4">
            <span
              class="text-lg font-semibold bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center mr-3"
              >3</span
            >
            <div>
              <h2 class="text-lg font-semibold mb-1">{{ $t('setup-mfa-page.step-3.line-1') }}</h2>
              <p class="text-gray-600">
                {{ $t('setup-mfa-page.step-3.line-2') }}
              </p>
            </div>
          </div>
          <div>
            <el-input />
          </div>
        </div>

        <!-- Right Section: Download Buttons -->
        <div class="lg:w-1/2 bg-blue-50 p-6 rounded-md shadow-md">
          <div class="flex flex-col items-center gap-3">
            <h4 class="font-bold">{{ $t('setup-mfa-page.step-3.line-3') }}</h4>
            <img :src="qrCode" alt="" class="w-[300px] h-[300px] object-cover" />
            <div class="text-blue-400 underline">{{ $t('setup-mfa-page.step-3.line-4') }}</div>
          </div>
        </div>
      </div>
      <div class="flex justify-end pr-10">
        <el-button type="info" size="large" class="w-[160px]">{{ $t('button.back') }}</el-button>
        <el-button type="primary" size="large" class="w-[160px]">{{
          $t('button.submit')
        }}</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import axios from "@/Plugins/axios.js";

export default {
  name: 'SetupAuthenticatorApp',
  data() {
    return {
      qrCode: '',
      query: this.$route.query
    };
  },
  created() {
    this.generateTotpQrcode();
  },
  methods: {
    async generateTotpQrcode() {
      try {
        const response = await axios.post('/2fa/generate', {
          data: this.query
        }, { responseType: 'arraybuffer' });
        const blob = new Blob([response.data], { type: 'image/png' });
        this.qrCode = URL.createObjectURL(blob);
      } catch (error) {
        this.$message.error(error.response.data.message || 'Something went wrong');
      }
    },
  },
}
</script>

<style scoped></style>
