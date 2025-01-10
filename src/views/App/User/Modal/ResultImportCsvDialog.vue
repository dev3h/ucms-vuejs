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
      <DataTable v-loading="loadingForm" :fields="fields" :items="items" footer-center>
        <template #importStatus="{ row }">
          <span>
            <img
              v-if="row?.importStatus === 'failure'"
              src="/images/svg/import-error.svg"
              class="w-5"
            />
            <img v-else src="/images/svg/import-success.svg" class="w-5" />
          </span>
        </template>
        <template #type="{ row }">
          <span>{{ row?.type === 1 ? $t('input.admin') : $t('input.user') }}</span>
        </template>
        <template #two_factor_enable="{ row }">
          <span>{{ row?.two_factor_enable ? $t('button.enable') : $t('button.disable') }}</span>
        </template>
      </DataTable>
    </div>
    <template #footer>
      <div class="flex justify-center items-center">
        <el-button type="info" size="large" @click="closeModal">{{ $t('button.close') }}</el-button>
        <el-button type="primary" size="large" @click="handleExport()">{{
          $t('button.export')
        }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import axios from '@/Plugins/axios'
import DialogHeader from '@/components/Dialog/DialogHeader.vue'
import DataTable from '@/components/Page/DataTable.vue'
import Papa from 'papaparse'

export default {
  components: { DialogHeader, DataTable },
  emits: ['close-modal'],
  data() {
    const fields = [
      {
        key: 'importStatus',
        width: 50,
        label: '',
        align: 'left',
        headerAlign: 'left',
        fixed: true
      },
      {
        key: 'name',
        'min-width': 200,
        label: this.$t('column.common.name'),
        align: 'left',
        headerAlign: 'left',
        fixed: true
      },
      {
        key: 'email',
        'min-width': 200,
        label: this.$t('input.common.email'),
        align: 'left',
        headerAlign: 'left'
      },
      {
        key: 'role_id',
        width: 200,
        'min-width': 200,
        label: this.$t('sidebar.role'),
        align: 'left',
        headerAlign: 'left'
      },
      {
        key: 'type',
        'min-width': 200,
        label: this.$t('input.type-user'),
        align: 'left',
        headerAlign: 'left'
      },
      {
        key: 'two_factor_enable',
        'min-width': 200,
        label: this.$t('column.2fa'),
        align: 'left',
        headerAlign: 'left'
      },
      {
        key: 'importMessage',
        'min-width': 200,
        label: this.$t('column.importMessage'),
        align: 'left',
        headerAlign: 'left',
        fixed: 'right'
      }
    ]

    return {
      isShowModal: false,
      current_id: null,
      loadingForm: false,
      items: [],
      fullscreen: false,
      filters: {
        name: null,
        role: null,
        page: 1
      },
      paginate: {},
      fields,
      selectedIndex: []
    }
  },
  methods: {
    async open(items) {
      if (items) {
        this.items = items
      }
      this.isShowModal = true
    },
    closeModal() {
      this.isShowModal = false
      this.items = []
      this.$emit('close-modal')
    },
    handleToggleFullScreen() {
      this.fullscreen = !this.fullscreen
    },
    handleExport() {
      // Chuyển đổi dữ liệu thành CSV
      const csv = Papa.unparse(this.items)
      const BOM = '\uFEFF'
      const csvWithBOM = BOM + csv

      // Tạo file và tải xuống
      const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', 'import-result.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
}
</script>
