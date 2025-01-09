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
    <div class="w-full">
      <DataTable
        v-loading="loadingForm"
        :fields="fields"
        :items="items"
        footer-center
        :enableSelectBox="true"
        @row-selected="handleSelectedRow"
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
          :disabled="selectedIndex?.length === 0"
          type="primary"
          size="large"
          @click="handleImport"
          >{{ $t('button.import') }}</el-button
        >
      </div>
    </template>
  </el-dialog>
  <ResultImportCsvDialog ref="resultImportCsvDialog" />
</template>

<script>
import axios from '@/Plugins/axios'
import DialogHeader from '@/components/Dialog/DialogHeader.vue'
import DataTable from '@/components/Page/DataTable.vue'
import ResultImportCsvDialog from './ResultImportCsvDialog.vue';

export default {
  components: { DialogHeader, DataTable, ResultImportCsvDialog },
  emits: ['close-modal'],
  props: {
    fetchData: {
      type: Function,
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
    handleSelectedRow(selected) {
      this.selectedIndex = selected?.map((item, index) => index)
    },
    async handleImport() {
      if (this.selectedIndex.length === 0) {
        this.$message.error(this.$t('message.no-row-selected'))
        return
      }
      try {
        const selectedItems = this.selectedIndex.map((index) => this.items[index])
        const response = await axios.post('/user/create-multi', selectedItems)
        if (response?.data?.status_code === 200) {
          const dataRes = response?.data?.data
          console.log(dataRes)
          if(dataRes?.length > 0) {
            this.isShowModal = false
            this.fetchData()
            this.$refs.resultImportCsvDialog.open(dataRes)
          }
        }
      } catch (err) {
        this.$message.error(err?.response?.data?.message || this.$t('message.something-wrong'))
      }
    }
  }
}
</script>
