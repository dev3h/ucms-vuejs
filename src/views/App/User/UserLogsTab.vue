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
  </div>
</template>

<script>
import DataTable from '@/components/Page/DataTable.vue'
import axios from '@/Plugins/axios'
import debounce from 'lodash.debounce'
export default {
  components: { DataTable },
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
          key: 'created_at',
          'min-width': 200,
          label: this.$t('column.time'),
          align: 'left',
          headerAlign: 'left'
        },
        {
          key: 'actor',
          'min-width': 400,
          label: this.$t('column.actor'),
          align: 'left',
          headerAlign: 'left'
        },
        {
          key: 'event',
          'min-width': 200,
          label: this.$t('column.event'),
          align: 'left',
          headerAlign: 'left'
        },
        {
          key: 'target',
          'min-width': 400,
          label: this.$t('column.target'),
          align: 'center',
          headerAlign: 'center'
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
          this.appRoute('admin.api.user.user-logs', {
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
          console.log(error)
        })
    },
    changePage(page) {
      this.fetchData(page)
    },
    filterData: debounce(function () {
      this.fetchData()
    }, 500),
    openAssign(id) {
      this.$refs.modalAssign.open(id, 'permission')
    },
    openIgnore(id) {
      this.$refs.modalIgnore.open(id)
    },
    openDeleteForm(id) {
      this.$refs.deleteForm.open(id)
    },
    async deleteItem(permissionId) {
      await axios
        .delete(
          this.appRoute('admin.api.role.revoke-permission', {
            id: this.id,
            permission_id: permissionId
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
