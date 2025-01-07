<template>
  <AdminLayout>
    <div class="w-full bg-white px-4">
      <div class="w-full pt-3 pb-2">
        <BreadCrumbComponent :bread-crumb="setbreadCrumbHeader" />
      </div>

      <div class="w-full">
        <div class="w-full flex flex-wrap justify-between gap-2 my-2">
          <div class="flex flex-wrap gap-2">
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
            <el-select
              v-model="filters.system_id"
              class="!w-[200px]"
              size="large"
              :placeholder="$t('input.common.select', { name: $t('sidebar.system') })"
              clearable
              @change="fetchData()"
            >
              <el-option
                v-for="item in systems"
                :key="item?.id"
                :label="item?.name"
                :value="item?.id"
              />
            </el-select>
            <div class="flex-col">
              <el-date-picker
                v-model="filters.created_at"
                type="date"
                :placeholder="$t('column.common.created-at')"
                size="large"
                class="!w-[185px]"
                value-format="YYYY-MM-DD"
                format="YYYY/MM/DD"
                @change="filterData()"
              />
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
          <template #system="{ row }">
            <router-link
              v-if="row?.system"
              class="text-primary hover:opacity-80"
              :to="{ name: 'system-show', params: { id: row?.system?.id } }"
            >
              {{ row?.system?.name }}
            </router-link>
          </template>
          <template #module_count="{ row }">
            <div class="flex gap-2 items-center">
              <img
                class="cursor-pointer"
                src="/images/svg/add-item.svg"
                alt=""
                @click="openAddModule(row?.id)"
              />
              <span
                @click="openModuleList(row?.id)"
                class="rounded-[50px] bg-gray-300 cursor-pointer px-2 py-1"
                >{{ row?.module_count }} {{ $t('button.item') }}</span
              >
            </div>
          </template>
          <template #action="{ row }">
            <div class="flex justify-center items-center gap-x-[12px]">
              <!-- <div class="cursor-pointer" @click="openShow(row?.id)">
                <img src="/images/svg/eye-icon.svg" />
              </div> -->
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
    <ModalSubSystem ref="modalSubSystem" @add-success="fetchData()" @update-success="fetchData()" />
    <ModalAddExtra
      ref="modalExtra"
      @add-success="fetchData()"
      :title="$t('dialog.add', { name: $t('sidebar.module') })"
      :placeholder="$t('input.common.select', { name: $t('sidebar.module') })"
      fetchRoute="/subsystem/:id/rest-modules"
      addRoute="/subsystem/:id/add-modules"
    />
    <ModalListChildren
      :title="$t('sidebar.module')"
      fetchRoute="/subsystem/:id/modules"
      deleteRoute="/subsystem/:id/remove-module/:childId"
      ref="modalList"
      showRoute="module-show"
      @close-modal="fetchData()"
      children_count_label="sidebar.action"
      children_key="action_count"
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
import ModalSubSystem from './ModalSubSystem.vue'
import ModalAddExtra from '@/components/Dialog/ModalAddExtra.vue'
import ModalListChildren from '@/components/Dialog/ModalListChildren.vue'
export default {
  components: {
    ModalSubSystem,
    AdminLayout,
    BreadCrumbComponent,
    DataTable,
    DeleteForm,
    ModalAddExtra,
    ModalListChildren
  },
  data() {
    return {
      items: [],
      systems: [],
      filters: {
        page: Number(this?.$route?.params?.page ?? 1),
        limit: Number(this?.$route?.query?.limit ?? 10)
      },
      subsystemDrawer: null,
      modalExtra: null,
      modalList: null,
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
          width: 200,
          label: this.$t('column.common.code'),
          align: 'left',
          headerAlign: 'left'
        },
        {
          key: 'system',
          'min-width': 300,
          label: this.$t('sidebar.system'),
          align: 'left',
          headerAlign: 'left'
        },
        {
          key: 'module_count',
          width: 200,
          label: this.$t('column.common.count', { name: this.$t('sidebar.module') }),
          align: 'left',
          headerAlign: 'left'
        },
        {
          key: 'created_at',
          width: 200,
          label: this.$t('column.common.created-at'),
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
      loadForm: false
    }
  },
  computed: {
    setbreadCrumbHeader() {
      let menuOrigin = searchMenu()
      return [
        {
          name: menuOrigin?.label,
          route: 'subsystem'
        }
      ]
    }
  },
  async created() {
    Promise.all([this.fetchData(), this.getAllSystem()])
  },
  methods: {
    async fetchData(page = 1) {
      this.loadForm = true
      this.filters.page = page
      let params = { ...this.filters }
      await axios
        .get('/subsystem', { params })
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
    async getAllSystem() {
      try {
        const response = await axios.get('/system')
        this.systems = response?.data?.data
      } catch (error) {
        this.$message.error(error?.response?.data?.message || this.$t('message.something-wrong'))
      }
    },
    changePage(page) {
      this.fetchData(page)
    },
    filterData: debounce(function () {
      this.fetchData()
    }, 500),
    openCreate() {
      this.$refs.modalSubSystem.open()
    },
    openEdit(id) {
      this.$refs.modalSubSystem.open(id)
    },
    openDeleteForm(id) {
      this.$refs.deleteForm.open(id)
    },
    openAddModule(id) {
      this.$refs.modalExtra.open(id)
    },
    openModuleList(id) {
      this.$refs.modalList.open(id)
    },
    async deleteItem(id) {
      await axios
        .delete(`/subsystem/${id}`)
        .then((response) => {
          this.$message.success(response?.data?.message)
          this.fetchData()
        })
        .catch((error) => {
          this.$message.error(error?.response?.data?.message || this.$t('message.something-wrong'))
        })
    },
    openShow(id) {
      // this.$refs.subsystemDrawer.open()
      this.$router.push({ name: 'subsystem-show', params: { id } })
    }
  }
}
</script>
<style></style>
