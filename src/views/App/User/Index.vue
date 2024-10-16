<template>
  <AdminLayout>
    <div class="w-full px-4 bg-white">
      <div class="w-full pt-3 pb-2">
        <BreadCrumbComponent :bread-crumb="setbreadCrumbHeader" />
      </div>

      <div class="w-full">
        <div class="w-full flex flex-wrap justify-between items-center my-2">
          <div class="flex flex-wrap gap-2">
            <el-input
              v-model="filters.search"
              class="!w-[200px]"
              size="large"
              :placeholder="$t('input.common.search')"
              clearable
              @input="filterData"
            >
              <template #prefix>
                <img src="/images/svg/search-icon.svg" alt="" />
              </template>
            </el-input>
            <el-select
              v-model="filters.role_id"
              class="!w-[200px]"
              size="large"
              :placeholder="$t('sidebar.role')"
              clearable
              @change="fetchData"
            >
              <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
            </el-select>
            <el-date-picker
              v-model="filters.created_at"
              type="date"
              :placeholder="$t('column.common.created-at')"
              size="large"
              class="!w-[200px]"
              value-format="YYYY-MM-DD"
              format="YYYY/MM/DD"
              @change="filterData"
            />
          </div>
          <div>
            <!-- <el-button size="large" @click="openImport()">{{ $t('button.import-csv') }}</el-button> -->
            <el-button type="primary" size="large" @click="openCreate()">{{
              $t('button.add')
            }}</el-button>
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
          @size-change="changeSize"
        >
         <template #roles="{ row }">
           <div class="flex gap-1">
             <span v-for="(role, index) in row?.roles" :key="index" class="bg-gray-200 rounded-full px-2 py-1 text-sm mr-2">
               {{ role }}
             </span>
            </div>
          </template>
          <template #activity="{ row }">
            <div class="flex justify-center">
              <div
                class="w-5 h-5 rounded-full"
                :class="row?.activity === 'online' ? 'bg-green-500' : 'bg-gray-300'"
              ></div>
            </div>
          </template>
          <template #action="{ row }">
            <div class="flex justify-center items-center gap-x-[12px]">
              <div class="cursor-pointer" @click="openShow(row?.id)">
                <img src="/images/svg/eye-icon.svg" />
              </div>
                <div class="cursor-pointer" @click="openEdit(row?.id)">
                <img src="/images/svg/pen-icon.svg" alt="" />
              </div>
              <div class="cursor-pointer" @click="openDeleteForm(row?.id)">
                <img src="/images/svg/trash-icon.svg" />
              </div>
            </div>
          </template>
        </DataTable>
      </div>
    </div>
    <DeleteForm ref="deleteForm" @delete-action="deleteAccount" />
    <ModalImport ref="modalImport" @import-success="fetchData" />
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
import ModalImport from './ModalImport.vue'

export default {
  components: { AdminLayout, BreadCrumbComponent, DataTable, DeleteForm, ModalImport },
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
        page: Number(this?.route?.params?.page ?? 1),
        limit: Number(this?.$route?.query?.limit ?? 10)
      },
      fields: [
        {
          key: 'name',
          'min-width': 200,
          label: this.$t('column.common.name'),
          align: 'left',
          headerAlign: 'left'
        },
        {
          key: 'email',
          'min-width': 200,
          label: this.$t('input.common.email'),
          align: 'left',
          headerAlign: 'left'
        },
        {
          key: 'roles',
          'min-width': 200,
          label: this.$t('sidebar.role'),
          align: 'left',
          headerAlign: 'left'
        },
        // {
        //   key: 'last_seen',
        //   width: 150,
        //   label: this.$t('column.last-seen'),
        //   align: 'left',
        //   headerAlign: 'left'
        // },
        // {
        //   key: 'activity',
        //   width: 150,
        //   label: this.$t('column.activity'),
        //   align: 'center',
        //   headerAlign: 'left'
        // },
        {
          key: 'created_at',
          width: 200,
          label: this.$t('column.common.created-at'),
          align: 'left',
          headerAlign: 'left'
        },
        {
          key: 'action',
          width: 200,
          label: '',
          align: 'center',
          headerAlign: 'center',
          fixed: 'right',
          minWidth: 200
        }
      ],
      paginate: {},
      loadForm: false
    }
  },
  computed: {
    setbreadCrumbHeader() {
      let menuOrigin = searchMenu()
      return [
        {
          name: menuOrigin?.label,
          route: 'user'
        }
      ]
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
        .get('user', {params})
        .then((response) => {
          this.items = response?.data?.data
          this.paginate = response?.data?.meta
          this.loadForm = false
        })
        .catch((error) => {
          this.$message.error(error?.response?.data?.message || this.$t('message.something-wrong'))
          this.loadForm = false
        })
    },
    changePage(page) {
      this.fetchData(page)
    },
    filterData: debounce(function () {
      this.fetchData()
    }, 500),
    openCreate() {
      this.$router.push({name: 'user-create'})
    },
    openEdit(id) {
      this.$router.push({name: 'user-edit', params: {id}})
    },
    openImport() {
      this.$refs.modalImport.open()
    },
    openDeleteForm(id) {
      this.$refs.deleteForm.open(id)
    },
    async deleteAccount(id) {
      await axios
        .delete(this?.$route('admin.api.user.destroy', id))
        .then((response) => {
          this.$message.success(response?.data?.message)
          this.fetchData()
        })
        .catch((error) => {
          this.$message.error(error?.response?.data?.message)
        })
    },
    openShow(id) {
      this.$router.push({name: 'user-show', params: {id}})
    },
    changeSize(value) {
      this.filters.page = 1
      this.filters.limit = value
      this.fetchData()
    }
  }
}
</script>
<style></style>
