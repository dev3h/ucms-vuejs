<template>
  <AdminLayout>
    <div class="w-full px-4 bg-white">
      <div class="">
        <div class="w-full pt-3 pb-2">
          <BreadCrumbComponent :bread-crumb="setbreadCrumbHeader" />
        </div>
        <div class="w-full my-[15px] flex items-center justify-between">
          <div class="w-full flex items-center flex-wrap gap-2">
            <el-input
              v-model="filters.search"
              size="large"
              :placeholder="$t('input.common.search')"
              clearable
              class="max-w-[300px]"
              @input="filterData"
            >
              <template #prefix>
                <img src="/images/svg/search-icon.svg" alt="" />
              </template>
            </el-input>
            <el-select
              v-model="filters.sender_type"
              size="large"
              :placeholder="$t('column.type-send')"
              clearable
              class="max-w-[200px]"
              :suffix-icon="getCaretBottom"
              @change="fetchData()"
            >
              <el-option :label="$t('column.all-users')" :value="1" />
              <el-option :label="$t('column.specific-users')" :value="2" />
            </el-select>
            <el-date-picker
              v-model="filters.published_at"
              size="large"
              :placeholder="$t('column.publish-at')"
              clearable
              format="YYYY/MM/DD"
              value-format="YYYY/MM/DD"
              class="max-w-[200px]"
              @change="fetchData()"
            />
          </div>
          <div class="w-fit">
            <el-button type="primary" size="large" class="button-min--width" @click="openCreate()">
              {{ $t('button.add') }}
            </el-button>
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
          <template #user_nicknames="{ row }">
            <div v-if="row?.sender_type == 1">{{ $t('column.all-users') }}</div>
            <div v-else>{{ $t('column.specific-users') }}</div>
          </template>
          <template #published_at="{ row }">
            <span v-if="row?.is_schedule == 1">
              {{ row?.published_at }}
            </span>
            <span v-else>
              {{ row?.created_at }}
            </span>
          </template>
          <template #action="{ row }">
            <div class="flex justify-center items-center gap-x-[12px]">
              <div class="cursor-pointer" @click="openShow(row?.id)">
                <img src="/images/svg/eye-icon.svg" alt="" />
              </div>
              <div v-if="row?.is_edit" class="cursor-pointer" @click="openEdit(row?.id)">
                <img src="/images/svg/pen-icon.svg" alt="" />
              </div>
              <div class="cursor-pointer" @click="openDeleteForm(row?.id)">
                <img src="/images/svg/trash-icon.svg" alt="" />
              </div>
            </div>
          </template>
        </DataTable>
      </div>
    </div>
    <DeleteForm
      ref="deleteForm"
      title="このお知らせを削除してよろしいでしょうか。"
      @delete-action="deleteNotification"
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
import { CaretBottom } from '@element-plus/icons-vue'
import debounce from 'lodash.debounce'

export default {
  name: 'NotificationList',
  components: { AdminLayout, BreadCrumbComponent, DataTable, DeleteForm },
  props: {
    roles: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loadForm: false,
      items: [],
      filters: {
        title: null,
        sender_type: null,
        published_at: null,
        page: 1,
        limit: 10
      },
      fields: [
        {
          key: 'title',
          'min-width': 400,
          label: this.$t('column.title'),
          align: 'left',
          headerAlign: 'left'
        },
        {
          key: 'user_nicknames',
          'min-width': 200,
          label: this.$t('column.type-send'),
          align: 'left',
          headerAlign: 'left'
        },
        {
          key: 'published_at',
          'min-width': 200,
          label: this.$t('column.publish-at'),
          align: 'left',
          headerAlign: 'left'
        },
        {
          key: 'created_at',
          'min-width': 200,
          label: this.$t('column.common.created-at'),
          align: 'left',
          headerAlign: 'left'
        },
        {
          key: 'action',
          label: '',
          width: 200,
          align: 'center',
          headerAlign: 'center',
          fixed: 'right'
        }
      ],
      paginate: {}
    }
  },
  computed: {
    setbreadCrumbHeader() {
      let menuOrigin = searchMenu()
      return [
        {
          name: menuOrigin?.label,
          route: null
        }
      ]
    },
    getCaretBottom() {
      return CaretBottom
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
        .get(this.appRoute('admin.api.notification.index', params))
        .then((response) => {
          this.items = response?.data?.data
          this.paginate = response?.data?.meta
          this.loadForm = false
        })
        .catch((error) => {
          console.log(error)
        })
    },
    changePage(page) {
      this.fetchData(page)
    },
    filterData: debounce(function () {
      this.fetchData()
    }, 500),
    changeSize(value) {
      this.filters.limit = value
      this.filters.page = 1
      this.fetchData()
    },
    openCreate() {
      this.$inertia.visit(this.appRoute('admin.notification.create'))
    },
    openEdit(id) {
      this.$inertia.visit(this.appRoute('admin.notification.update', id))
    },
    openDeleteForm(id) {
      this.$refs.deleteForm.open(id)
    },
    async deleteNotification(id) {
      await axios
        .delete(this.appRoute('admin.api.notification.delete', id))
        .then(({ data }) => {
          this.$message.success(data?.message)
          this.fetchData()
        })
        .catch((error) => {
          this.$message.error(error?.response?.data?.message)
        })
    },
    openShow(id) {
      this.$inertia.visit(this.appRoute('admin.notification.show', id))
    }
  }
}
</script>
<style></style>
