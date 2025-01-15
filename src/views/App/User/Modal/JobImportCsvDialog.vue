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
        :title="$t('dialog.import-from-csv')"
        :isFullscreen="fullscreen"
        @toggleFullscreen="handleToggleFullScreen"
      />
    </template>
    <div class="w-full">
      {{ $t('message.job', { count: itemCount}) }}
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
    async open(itemCount) {
      if (itemCount) {
        this.itemCount = itemCount
      }
      this.isShowModal = true
    },
    closeModal() {
      this.isShowModal = false
      this.itemCount = 0
      this.$emit('close-modal')
    },
    handleToggleFullScreen() {
      this.fullscreen = !this.fullscreen
    }
  }
}
</script>
