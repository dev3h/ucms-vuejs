<template>
  <div>
    <div class="w-full">
      <div class="w-full flex justify-between items-center my-2">
        <div class="w-80">
          <el-input
            v-model="filters.search"
            class="w-full"
            size="large"
            :placeholder="$t('input.common.search')"
            clearable
            @input="filterData"
          >
            <template #prefix>
              <img src="/images/svg/search-icon.svg" alt="" />
            </template>
          </el-input>
        </div>
        <div class="flex justify-end w-full">
          <el-button type="primary" size="large" @click="openAssign(id)">{{
            $t('button.add')
          }}</el-button>
        </div>
        <DeleteForm ref="deleteForm" @delete-action="deleteItem" />
      </div>
    </div>

    <div class="w-full">
      <DataTable
        v-loading="loadForm"
        :fields="fields"
        :items="items"
        :paginate="paginate"
        footer-center
        paginate-background
        @page-change="changePage"
      >
        <template #action="{ row }">
          <div class="flex justify-center items-center gap-x-[12px]">
            <div class="cursor-pointer" @click="openDeleteForm(row?.id)">
              <img src="/images/svg/trash-icon.svg" />
            </div>
          </div>
        </template>
      </DataTable>
    </div>
    <ModalExtraAdd ref="modalAssign" @add-success="fetchData" />
  </div>
</template>

<script>
import AdminLayout from '@/Layouts/AdminLayout.vue'
import BreadCrumbComponent from '@/components/Page/BreadCrumb.vue'
import DataTable from '@/components/Page/DataTable.vue'
import axios from '@/Plugins/axios'
import DeleteForm from '@/components/Page/DeleteForm.vue'
import debounce from 'lodash.debounce'
import ModalAssign from '@/Pages/Role/ModalAssign.vue'
import ModalExtraAdd from '@/Pages/Module/ModalExtraAdd.vue'
export default {
  components: {
    ModalExtraAdd,
    ModalAssign,
    AdminLayout,
    BreadCrumbComponent,
    DataTable,
    DeleteForm
  },
  props: {
    id: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      items: [],
      filters: {
        name: null,
        role: null,
        page: Number(this.appRoute().params?.page ?? 1)
      },
      fields: [
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
        },
        {
          key: 'action',
          label: '',
          align: 'center',
          headerAlign: 'center',
          fixed: 'right',
          width: 200
        }
      ],
      paginate: {},
      loadForm: false
    }
  },
  async created() {
    await this.fetchData()
  },
  methods: {
    async fetchData(page = 1) {
      this.loadForm = true
      this.filters.page = page
      let params = { ...this.filters }
      await axios
        .get(
          this.appRoute('admin.api.module.all-subsystem', {
            id: this.id,
            ...params
          })
        )
        .then((response) => {
          this.items = response?.data?.data
          this.paginate = response?.data?.meta
          this.loadForm = false
        })
        .catch((error) => {
          this.$message.error(error?.response?.data?.message)
        })
    },
    changePage(page) {
      this.fetchData(page)
    },
    filterData: debounce(function () {
      this.fetchData()
    }, 500),
    openAssign(id) {
      this.$refs.modalAssign.open(id, 'subsystem')
    },
    openDeleteForm(id) {
      this.$refs.deleteForm.open(id)
    },
    async deleteItem(subsystemId) {
      await axios
        .delete(
          this.appRoute('admin.api.module.remove-subsystem', {
            id: this.id,
            subsystem_id: subsystemId
          })
        )
        .then((response) => {
          this.$message.success(response?.data?.message)
          this.fetchData()
        })
        .catch((error) => {
          this.$message.error(error?.response?.data?.message)
        })
    },
    openShow(id) {
      this.$inertia.visit(this.appRoute('admin.role.show', id))
    }
  }
}
</script>
