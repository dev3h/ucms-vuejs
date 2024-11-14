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
        :title="title"
        :isFullscreen="fullscreen"
        @toggleFullscreen="handleToggleFullScreen"
      />
    </template>
    <div class="w-full">
      <div class="flex border">
        <div class="flex-1 border-r">
          <el-select
            v-model="dataExtra"
            multiple
            filterable
            :filter-method="filterOptions"
            :placeholder="placeholder"
          >
            <el-option v-for="item in items" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-center items-center">
        <el-button type="info" size="large" @click="closeModal">{{ $t('button.cancel') }}</el-button>
        <el-button type="primary" size="large" @click="handleAddExtra" :loading="loadingForm">{{ $t('button.add') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import axios from '@/Plugins/axios'
import DialogHeader from '@/components/Dialog/DialogHeader.vue'

export default {
  components: { DialogHeader },
  props: {
    title: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      required: true
    },
    fetchRoute: {
      type: String,
      required: true
    },
    addRoute: {
      type: String,
      required: true
    }
  },
  emits: ['add-success'],
  data() {
    return {
      isShowModal: false,
      current_id: null,
      loadingForm: false,
      items: [],
      fullscreen: false,
      dataExtra: [],
      filteredOptions: []
    }
  },
  methods: {
    async open(id) {
      if (id) {
        this.current_id = id
        await this.fetchData()
      }
      this.isShowModal = true
    },
    closeModal() {
      this.isShowModal = false
      this.current_id = null
      this.items = []
      this.dataExtra = []
      this.filteredOptions = []
    },
    filterOptions(query) {
      if (!query) {
        this.filteredOptions = this.options
      } else {
        const normalizedQuery = this.normalizeText(query)
        this.filteredOptions = this.options.filter((item) => {
          const normalizedLabel = this.normalizeText(item.name)
          return normalizedLabel.includes(normalizedQuery)
        })
      }
    },
    normalizeText(text) {
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    },
    async fetchData() {
      try {
        const response = await axios.get(this.fetchRoute.replace(':id', this.current_id))
        if (response?.data?.status_code === 200) {
          this.items = response?.data?.data
        }
      } catch (error) {
        this.$message.error(error?.response?.data?.message || this.$t('message.something-wrong'))
      }
    },
    async handleAddExtra() {
      this.loadingForm = true
      const response = await axios.post(this.addRoute.replace(':id', this.current_id), this.dataExtra)
      this.$message({
        type: response?.data?.status_code === 200 ? 'success' : 'error',
        message: response?.data?.message
      })
      this.loadingForm = false
      if (response?.data?.status_code === 200) {
        this.closeModal()
        this.$emit('add-success')
      }
    },
    handleToggleFullScreen() {
      this.fullscreen = !this.fullscreen
    }
  }
}
</script>