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
        :paginate="paginate"
        footer-center
        paginate-background
        @page-change="changePage"
      >
        <template #session_type="{ row }">
          <div>
            {{ row?.session_type === 1 ? 'Admin' : 'SSO' }}
          </div>
        </template>
        <template #action="{ row }">
          <div class="flex justify-center items-center gap-x-[12px]">
            <div class="cursor-pointer hover:opacity-85 font-bold" @click="openDeleteForm(row?.id)">
              <span>{{$t('pop-menu.logout')}}</span>
            </div>
          </div>
        </template>
      </DataTable>
    </div>
    <template #footer>
      <div class="flex justify-center items-center">
        <el-button type="info" size="large" @click="closeModal">{{ $t('button.close') }}</el-button>
      </div>
    </template>
  </el-dialog>
  <DeleteForm ref="deleteForm" @delete-action="deleteItem" />
</template>

<script>
import axios from '@/Plugins/axios'
import DialogHeader from '@/components/Dialog/DialogHeader.vue'
import DataTable from '@/components/Page/DataTable.vue'
import DeleteForm from '@/components/Page/DeleteForm.vue'

export default {
  components: { DialogHeader, DataTable, DeleteForm },
  emits: ['close-modal'],
  data() {
    const fields = [
      {
        key: 'os',
        'min-width': 400,
        label: this.$t('column.os'),
        align: 'left',
        headerAlign: 'left'
      },
       {
        key: 'browser',
        'min-width': 400,
        label: this.$t('column.browser'),
        align: 'left',
        headerAlign: 'left'
      },
      {
        key: 'ip_address',
        'min-width': 400,
        label: this.$t('column.ip'),
        align: 'left',
        headerAlign: 'left'
      },
      {
        key: 'session_type',
        'min-width': 400,
        label: this.$t('column.session_type'),
        align: 'left',
        headerAlign: 'left'
      },
      {
        key: 'action',
        width: 200,
        label: '',
        align: 'center',
        headerAlign: 'center',
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
      fields
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
      this.filters.page = 1
      this.$emit('close-modal')
    },
    async fetchData(page = 1) {
      this.loadingForm = true
      this.filters.page = page
      let params = { ...this.filters }
      await axios
        .get(`user/${this.current_id}/device-session`, { params })
        .then((response) => {
          this.items = response?.data?.data
          this.paginate = response?.data?.meta
          this.loadingForm = false
        })
        .catch((error) => {
          this.loadingForm = false
          //   this.$message.error(error?.response?.data?.message)
        })
    },
    openDeleteForm(id) {
      this.$refs.deleteForm.open(id)
    },
    changePage(page) {
      this.fetchData(page)
    },
    async deleteItem(id) {
      const deviceSession = this.items.find((item) => item.id === id)
      await axios
        .post(`user/${this.current_id}/device-session/${deviceSession.device_id}/logout`)
        .then((response) => {
          this.$message.success(response?.data?.message)
          this.fetchData()
        })
        .catch((error) => {
          this.$message.error(error?.response?.data?.message)
        })
    },
    openShow(id) {
      this.$router.push({ name: this.showRoute, params: { id } })
    },
    handleToggleFullScreen() {
      this.fullscreen = !this.fullscreen
    }
  }
}
</script>
