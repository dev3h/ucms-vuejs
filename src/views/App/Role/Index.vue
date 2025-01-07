<template>
  <AdminLayout>
    <div class="w-full px-4 bg-white">
      <div class="w-full pt-3 pb-2">
        <BreadCrumbComponent :bread-crumb="setbreadCrumbHeader" />
      </div>

      <div class="w-full">
        <div class="w-full flex justify-between items-center my-2">
          <div class="w-80">
            <el-input
              v-model="filters.name"
              class="w-full"
              size="large"
              :placeholder="$t('input.common.search')"
              clearable
            >
              <template #prefix>
                <img src="/images/svg/search-icon.svg" alt="" />
              </template>
            </el-input>
          </div>
          <el-button type="primary" size="large" @click="openCreate()">{{
            $t('button.add')
          }}</el-button>
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
          <template #assigned="{ row }">
            <span v-if="row?.assigned === 0">-</span>
            <span v-else> {{ row?.assigned }} {{ $t('column.users') }} </span>
          </template>
          <template #number_of_user="{ row }">
            <div class="flex gap-2 items-center">
              <img
                class="cursor-pointer"
                src="/images/svg/add-item.svg"
                alt=""
                @click="openAddUser(row?.id)"
              />
              <span
                @click="openUserList(row?.id)"
                class="rounded-[50px] bg-gray-300 cursor-pointer px-2 py-1"
              >
                {{ row?.number_of_user }} {{ $t('column.users') }}
              </span>
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
    <DeleteForm ref="deleteForm" @delete-action="deleteItem" />
    <ModalAddExtra
      ref="modalExtra"
      @add-success="fetchData()"
      :title="$t('dialog.add', { name: $t('sidebar.user') })"
      :placeholder="$t('input.common.select', { name: $t('sidebar.user') })"
      fetchRoute="/role/:id/rest-users"
      addRoute="/role/:id/add-users"
    />
    <ModalListChildren
      :title="$t('sidebar.user')"
      fetchRoute="/role/:id/users"
      deleteRoute="/role/:id/remove-user/:childId"
      ref="modalList"
      showRoute="user-show"
      @close-modal="fetchData()"
      :isCodeField="false"
      :fieldsExtra="fieldsExtra"
    />
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
import ModalAddExtra from '@/components/Dialog/ModalAddExtra.vue'
import ModalListChildren from '@/components/Dialog/ModalListChildren.vue'

export default {
  components: { AdminLayout, BreadCrumbComponent, DataTable, DeleteForm, ModalAddExtra, ModalListChildren },
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
        role: null,
        page: Number(this?.$route?.params?.page ?? 1),
        limit: Number(this?.$route?.query?.limit ?? 10),
      },
      fields: [
        {
          key: 'name',
          'min-width': 400,
          label: this.$t('column.common.name'),
          align: 'left',
          headerAlign: 'left',
          fixed: true
        },
        {
          key: 'code',
          'min-width': 300,
          label: this.$t('column.common.code'),
          align: 'left',
          headerAlign: 'left'
        },
        {
          key: 'number_of_permission',
          'min-width': 300,
          label: this.$t('column.number-permission'),
          align: 'left',
          headerAlign: 'left'
        },
        {
          key: 'number_of_user',
          'min-width': 300,
          label: this.$t('column.number-user'),
          align: 'left',
          headerAlign: 'left'
        },
        {
          key: 'action',
          width: 150,
          label: '',
          align: 'center',
          headerAlign: 'center',
          fixed: 'right'
        }
      ],
      fieldsExtra: [
        {
          key: 'email',
          'min-width': 200,
          label: this.$t('input.common.email'),
          align: 'left',
          headerAlign: 'left'
        },
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
          route: 'role'
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
        .get('/role', { params })
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
    changePage(page) {
      this.fetchData(page)
    },
    filterData: debounce(function () {
      this.fetchData()
    }, 500),
    openCreate() {
      this.$router.push({ name: 'role-create' })
    },
    openAddUser(id) {
      this.$refs.modalExtra.open(id)
    },
    openUserList(id) {
      this.$refs.modalList.open(id)
    },
    openEdit(id) {
      this.$router.push({ name: 'role-edit', params: { id } })
    },
    openDeleteForm(id) {
      this.$refs.deleteForm.open(id)
    },
    async deleteItem(id) {
      await axios
        .delete(`/role/${id}`)
        .then((response) => {
          this.$message.success(response?.data?.message)
          this.fetchData()
        })
        .catch((error) => {
          this.$message.error(error?.response?.data?.message)
        })
    },
    openShow(id) {
      this.$router.push({ name: 'role-show', params: { id } })
    }
  }
}
</script>
<style></style>
