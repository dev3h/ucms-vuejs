<template>
  <el-dialog
    v-model="isShowModal"
    :close-on-click-modal="false"
    :before-close="closeModal"
    :fullscreen="fullscreen"
    class="dialog-base"
  >
    <template #header>
      <DialogHeader
        :title="$t('auth-page.2fa-challenge-page.recovery-code')"
        :isFullscreen="fullscreen"
        @toggleFullscreen="handleToggleFullScreen"
      />
    </template>
    <div class="w-full">
        <div class="text-xl">
            {{ $t('auth-page.recovery-code-save.line1') }}
        </div>
        <div class="text-xl">
            {{ $t('auth-page.recovery-code-save.line2') }}
        </div>
      <ul class="grid grid-cols-2 gap-5 list-disc px-9 max-w-[500px] mx-auto mt-5">
        <li v-for="(code, index) in recoveryCodes" :key="index" class="text-center font-bold text-lg">
          {{ code }}
        </li>
        <el-button type="primary" @click="handleDownload">{{ $t('button.download') }}</el-button>
        <el-button type="success" @click="handleCopyClipBoard">{{ $t('button.copy') }}</el-button>
      </ul>
    </div>
    <template #footer>
      <div class="flex justify-center items-center">
        <el-button type="info" size="large" @click="closeModal">{{ $t('button.close') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import DialogHeader from '@/components/Dialog/DialogHeader.vue'

export default {
  components: { DialogHeader },
  emits: ['close-modal'],
  data() {
    return {
      isShowModal: false,
      loadingForm: false,
      fullscreen: false,
    }
  },
  methods: {
    async open(recoveryCodes) {
      if (recoveryCodes) {
        this.recoveryCodes = recoveryCodes
      }
      this.isShowModal = true
    },
    closeModal() {
      this.isShowModal = false
      this.recoveryCodes = []
      this.$emit('close-modal')
    },
    handleToggleFullScreen() {
      this.fullscreen = !this.fullscreen
    },
    handleDownload() {
      const text = this.recoveryCodes.join('\n')
      const blob = new Blob([text], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'recovery-codes.txt'
      a.click()
      URL.revokeObjectURL(url)
    },
    handleCopyClipBoard() {
      const text = this.recoveryCodes.join('\n')
      navigator.clipboard.writeText(text)
      this.$message.success(this.$t('message.copy-success'))
    }
  }
}
</script>
