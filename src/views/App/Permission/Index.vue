<template>
  <AdminLayout>
    <div class="w-full px-4 bg-white">
      <div class="w-full pt-3 pb-2">
        <BreadCrumbComponent :bread-crumb="setbreadCrumbHeader" />
      </div>

      <div class="w-full">
        <div class="w-full flex justify-between gap-2 my-2">
          <div class="flex gap-2">
            <div class="col-span-1">
              <el-input
                v-model="filters.search"
                class="!w-[320px]"
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
          </div>
          <div>
            <div class="w-full flex justify-between items-center">
              <div>
                <el-button type="primary" size="large" @click="openCreate()">{{
                  $t('button.add')
                }}</el-button>
              </div>
            </div>
          </div>
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
        <template #code="{row}">
          <div @click="openCodeInfoDialog(row?.id)" class="cursor-pointer">
            {{ row?.code }}
          </div>

        </template>
          <template #action="{ row }">
            <div class="flex justify-center items-center gap-x-[12px]">
              <!--                            <div class="cursor-pointer" @click="openShow(row?.id)">-->
              <!--                                <img src="/images/svg/eye-icon.svg" />-->
              <!--                            </div>-->
              <div class="cursor-pointer" @click="openEdit(row?.id)">
                <img src="/images/svg/pen-icon.svg" />
              </div>
              <div class="cursor-pointer" @click="openDeleteForm(row?.id)">
                <img src="/images/svg/trash-icon.svg" />
              </div>
            </div>
          </template>
        </DataTable>
      </div>
    </div>
    <DeleteForm ref="deleteForm" @delete-action="deleteItem" />
    <ModalPermission
      ref="modalPermission"
      @add-success="fetchData()"
      @update-success="fetchData()"
    />
    <CodeInfoDialog ref="codeInfoDialog" />
  </AdminLayout>
</template>
<script>
import AdminLayout from '@/Layouts/AdminLayout.vue'
import BreadCrumbComponent from '@/components/Page/BreadCrumb.vue'
import { searchMenu } from '@/Mixins/breadcrumb.js'
import DataTable from '@/components/Page/DataTable.vue'
import axios from '@/Plugins/axios'
import DeleteForm from '@/components/Page/DeleteForm.vue'
import debounce from 'lodash.debounce'
import ModalPermission from './ModalPermission.vue'
import CodeInfoDialog from './Dialog/CodeInfoDialog.vue'
// import ModalSubSystem from '@/Pages/SubSystem/ModalSubSystem.vue'
export default {
  components: {
    // ModalSubSystem,
    ModalPermission,
    AdminLayout,
    BreadCrumbComponent,
    DataTable,
    DeleteForm,
    CodeInfoDialog
  },
  props: {
    roles: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      items: [],
      filters: {
        name: null,
        page: Number(this?.$route?.params?.page ?? 1),
        limit: Number(this?.$route?.query?.limit ?? 10)
      },
      fields: [
        {
          key: 'code',
          'min-width': 300,
          label: this.$t('column.common.code'),
          align: 'left',
          headerAlign: 'left'
        },
        {
          key: 'description',
          'min-width': 400,
          label: this.$t('column.description'),
          align: 'left',
          headerAlign: 'left'
        },
        {
          key: 'action',
          width: 150,
          label: '',
          align: 'center',
          headerAlign: 'center',
          fixed: 'right',
          minWidth: 200
        }
      ],
      paginate: {},
      loadForm: false,
      codeInfoDialog: null
    }
  },
  computed: {
    setbreadCrumbHeader() {
      let menuOrigin = searchMenu()
      return [
        {
          name: menuOrigin?.label,
          route: 'permission'
        }
      ]
    }
  },
  async created() {
    await this.fetchData()
    // await this.asyncPermission()
  },
  methods: {
    async fetchData(page = 1) {
      this.loadForm = true
      this.filters.page = page
      let params = { ...this.filters }
      await axios
        .get('/permission', { params })
        .then((response) => {
          this.items = response?.data?.data
          this.paginate = response?.data?.meta
          this.loadForm = false
        })
        .catch((error) => {
          this.loadForm = false
          this.$message.error(error?.response?.data?.message || this.$t('message.something-wrong'))
        })
    },
    async asyncPermission() {
      await axios.post('/permission/async')
    },
    changePage(page) {
      this.fetchData(page)
    },
    filterData: debounce(function () {
      this.fetchData()
    }, 500),
    openCreate() {
      this.$refs.modalPermission.open()
    },
    openEdit(id) {
      this.$refs.modalPermission.open(id)
    },
    openDeleteForm(id) {
      this.$refs.deleteForm.open(id)
    },
    openCodeInfoDialog(id) {
      this.$refs.codeInfoDialog.open(id)
    },
    async deleteItem(id) {
      await axios
        .delete(`/permission/${id}`)
        .then((response) => {
          this.$message.success(response?.data?.message)
          this.fetchData()
        })
        .catch((error) => {
          this.$message.error(error?.response?.data?.message)
        })
    },
  }
}
</script>
<style></style>
