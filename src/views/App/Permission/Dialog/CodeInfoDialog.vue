<template>
  <el-dialog
    v-model="isShowModal"
    :close-on-click-modal="false"
    :before-close="closeModal"
    :fullscreen="fullscreen"
    class="dialog-base !w-[500px]"
  >
    <template #header>
      <DialogHeader
        :title="$t('dialog.code-info')"
        :isFullscreen="fullscreen"
        @toggleFullscreen="handleToggleFullScreen"
      />
    </template>
    <div class="w-full">
      <div>{{ $t('sidebar.system') }}: {{ info.system }}</div>
      <div>{{ $t('sidebar.subsystem') }}: {{ info.subsystem }}</div>
      <div>{{ $t('sidebar.module') }}: {{ info.module }}</div>
      <div>{{ $t('sidebar.action') }}: {{ info.action }}</div>
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
import axios from '@/Plugins/axios'

export default {
  components: { DialogHeader },
  emits: ['close-modal'],
  data() {
    return {
      isShowModal: false,
      loadingForm: false,
      fullscreen: false,
      info: null
    }
  },
  methods: {
    async open(id) {
      if (id) {
        this.id = id
        await this.fetchData()
      }
      this.isShowModal = true
    },
    closeModal() {
      this.isShowModal = false
      this.id = null
      this.info = null
      this.$emit('close-modal')
    },
    async fetchData() {
      try {
        const response = await axios.get(`/permission/${this.id}/code-info`)
        this.info = response?.data?.data
      } catch (error) {
        this.$message({
          type: 'error',
          message: error?.response?.data?.message || this.$t('something-wrong')
        })
      }
    },
    handleToggleFullScreen() {
      this.fullscreen = !this.fullscreen
    }
  }
}
</script>
