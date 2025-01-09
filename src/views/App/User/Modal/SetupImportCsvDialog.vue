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
        :title="$t('column.history-login')"
        :isFullscreen="fullscreen"
        @toggleFullscreen="handleToggleFullScreen"
      />
    </template>
    <div class="w-full px-5">
      <div class="flex justify-between gap-2">
        <div
          @click="downloadTemplate"
          class="border flex-1 py-9 flex flex-col gap-2 items-center cursor-pointer hover:opacity-85"
        >
          <img src="/images/svg/download.svg" class="!w-5" />
          <span class="font-bold">{{ $t('button.download-csv-template') }}</span>
        </div>
        <div
          @click="openUploadDialog"
          class="border flex flex-1 py-9 flex-col gap-2 items-center cursor-pointer hover:opacity-85"
        >
          <img src="/images/svg/upload.svg" />
          <span class="font-bold">{{ $t('button.upload-csv') }}</span>
        </div>
      </div>
    </div>
  </el-dialog>
  <ImportCsvForm ref="importCsvForm" :fetchData="fetchData" />
</template>

<script>
import DialogHeader from '@/components/Dialog/DialogHeader.vue'
import ImportCsvForm from './ImportCsvForm.vue'

export default {
  components: { DialogHeader, ImportCsvForm },
  emits: ['close-modal'],
  props: {
    fetchData: {
      type: Function
    }
  },
  data() {
    return {
      isShowModal: false,
      fullscreen: false
    }
  },
  methods: {
    async open() {
      this.isShowModal = true
    },
    closeModal() {
      this.isShowModal = false
      this.$emit('close-modal')
    },
    openUploadDialog() {
      this.isShowModal = false
      this.$refs.importCsvForm.open()
    },
    downloadTemplate() {
      const link = document.createElement('a')
      link.href = '/csv/template.csv' // Path to your CSV file in the public folder
      link.download = 'template.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    handleToggleFullScreen() {
      this.fullscreen = !this.fullscreen
    }
  }
}
</script>
