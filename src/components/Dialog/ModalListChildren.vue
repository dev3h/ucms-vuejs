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
      <DataTable
        v-loading="loadingForm"
        :fields="fields"
        :items="items"
        :paginate="paginate"
        footer-center
        paginate-background
        @page-change="changePage"
      >
        <template #children="{ row }">
          <div>
            <div class="flex gap-2 items-center">
              <span class="rounded-[50px] bg-gray-300 px-2 py-1"
                >{{ row?.[children_key] }} {{ $t('button.item') }}
              </span>
            </div>
          </div>
        </template>
        <template #action="{ row }">
          <div class="flex justify-center items-center gap-x-[12px]">
            <!-- <div class="cursor-pointer" @click="openShow(row?.id)">
              <img src="/images/svg/eye-icon.svg" />
            </div> -->
            <div class="cursor-pointer" @click="openDeleteForm(row?.id)">
              <img src="/images/svg/trash-icon.svg" />
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
  props: {
    title: {
      type: String,
      required: true
    },
    fetchRoute: {
      type: String,
      required: true
    },
    showRoute: {
      type: String
    },
    deleteRoute: {
      type: String,
      required: true
    },
    children_key: {
      type: String,
      required: false
    },
    children_count_label: {
      type: String,
      required: false
    }
  },
  emits: ['close-modal'],
  data() {
    const fields = [
      {
        key: 'name',
        'min-width': 400,
        label: this.$t('column.common.name'),
        align: 'left',
        headerAlign: 'left'
      },
      {
        key: 'code',
        'min-width': 400,
        label: this.$t('column.common.code'),
        align: 'left',
        headerAlign: 'left'
      }
    ]

    if (this.children_key) {
      fields.push({
        key: 'children',
        'min-width': 400,
        label: this.$t('column.common.count', { name: this.$t(this.children_count_label) }),
        align: 'left',
        headerAlign: 'left'
      })
    }

    fields.push({
      key: 'action',
      width: 200,
      label: '',
      align: 'center',
      headerAlign: 'center',
      fixed: 'right'
    })
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
        .get(this.fetchRoute.replace(':id', this.current_id), { params })
        .then((response) => {
          this.items = response?.data?.data
          this.paginate = response?.data?.meta
          this.loadingForm = false
        })
        .catch((error) => {
          this.$message.error(error?.response?.data?.message)
        })
    },
    openDeleteForm(id) {
      this.$refs.deleteForm.open(id)
    },
    changePage(page) {
      this.fetchData(page)
    },
    async deleteItem(childId) {
      await axios
        .delete(this.deleteRoute.replace(':id', this.current_id).replace(':childId', childId))
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
