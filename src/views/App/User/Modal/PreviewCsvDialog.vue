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
      <DataTable
        v-loading="loadingForm"
        :fields="fields"
        :items="items"
        footer-center
        :enableSelectBox="true"
        @row-selected="handleSelectedRow"
        :paginate="paginate"
        paginate-background
        @page-change="changePage"
        @size-change="changeSize"
        rowKey="email"
      >
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
        <el-button
          :loading="isLoad"
          v-if="fullItems?.length > 10"
          type="success"
          size="large"
          @click="handleImportAll"
          >{{ $t('button.import-all') }}
        </el-button>
        <el-button
          :loading="isLoading"
          :disabled="selectedIndex?.length === 0"
          type="primary"
          size="large"
          @click="handleImport"
          >{{ $t('button.import') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
  <ResultImportCsvDialog ref="resultImportCsvDialog" />
  <JobImportCsvDialog ref="jobImportCsvDialog" />
</template>

<script>
import axios from '@/Plugins/axios'
import DialogHeader from '@/components/Dialog/DialogHeader.vue'
import DataTable from '@/components/Page/DataTable.vue'
import ResultImportCsvDialog from './ResultImportCsvDialog.vue';
import JobImportCsvDialog from './JobImportCsvDialog.vue';

export default {
  components: { DialogHeader, DataTable, ResultImportCsvDialog, JobImportCsvDialog },
  emits: ['close-modal'],
  props: {
    fetchData: {
      type: Function
    }
  },
  data() {
    const fields = [
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
      }
    ]

    return {
      isShowModal: false,
      current_id: null,
      loadingForm: false,
      items: [],
      fullItems: [],
      fullscreen: false,
      filters: {
        limit: 10,
        page: 1
      },
      paginate: {},
      fields,
      selectedIndex: [],
      isLoading: false,
      isLoad: false
    }
  },
  methods: {
    async open(items) {
      if (items) {
        const limitItem = items.slice(0, this.filters.limit)
        this.items = limitItem
        this.fullItems = items
        this.paginate = this.generatePaginationMeta(items, 1, this.filters.limit)
      }
      this.isShowModal = true
    },
    generatePaginationMeta(items, currentPage, perPage) {
      const total = items.length
      const lastPage = Math.ceil(total / perPage)
      const from = (currentPage - 1) * perPage + 1
      const to = Math.min(currentPage * perPage, total)

      return {
        total,
        per_page: perPage,
        current_page: currentPage,
        last_page: lastPage,
        from,
        to
      }
    },
    closeModal() {
      this.isShowModal = false
      this.items = []
      this.$emit('close-modal')
    },
    handleToggleFullScreen() {
      this.fullscreen = !this.fullscreen
    },
    handleSelectedRow(selected) {
      this.selectedIndex = selected?.map((item, index) => index)
    },
    async handleImport() {
      if (this.selectedIndex.length === 0) {
        this.$message.error(this.$t('message.no-row-selected'))
        return
      }
      const selectedItems = this.selectedIndex.map((index) => this.items[index])
      await this.importItems(selectedItems)
    },
    async handleImportAll() {
      await this.importItems(this.fullItems, 'all')
    },
    async importItems(items, type = 'selected') {
      try {
        type === 'selected' ? (this.isLoading = true) : (this.isLoad = true)
        const response = await axios.post('/user/create-multi', items)
        if (response?.data?.status_code === 200) {
          const dataRes = response?.data?.data
          if(dataRes?.length > 0 && items?.length <= 100) {
            this.isShowModal = false
            this.fetchData()
            this.$refs.resultImportCsvDialog.open(dataRes)
          } else {
            this.isShowModal = false
            const itemCount = items?.length
            this.$refs.jobImportCsvDialog.open(itemCount)
          }
        }
        type === 'selected' ? (this.isLoading = false) : (this.isLoad = false)
      } catch (err) {
        type === 'selected' ? (this.isLoading = false) : (this.isLoad = false)
        this.$message.error(err?.response?.data?.message || this.$t('message.something-wrong'))
      }
    },
    changePage(page) {
      this.paginate.current_page = page
      const start = (page - 1) * this.filters.limit
      const end = start + this.filters.limit
      this.items = this.fullItems.slice(start, end)
    },
    changeSize(value) {
      this.filters.page = 1
      this.filters.limit = value
      this.paginate = this.generatePaginationMeta(this.fullItems, 1, value)
      this.items = this.fullItems.slice(0, value)
    }
  }
}
</script>
