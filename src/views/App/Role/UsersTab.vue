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
        <!--                <div class="flex justify-end w-full">-->
        <!--                    <el-button type="primary" size="large" @click="openCreate()">Assign users</el-button>-->
        <!--                </div>-->
        <!--                <DeleteForm ref="deleteForm" @delete-action="deleteItem" />-->
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
        <template #email="{ row }">
          <Link v-if="row?.id" :href="route('admin.user.show', row?.id)">{{ row?.email }}</Link>
        </template>
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
import DeleteForm from '@/components/Page/DeleteForm.vue'
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
        page: this.$route.query.page || 1
      },
      fields: [
        {
          key: 'email',
          'min-width': 400,
          label: this.$t('sidebar.user'),
          align: 'left',
          headerAlign: 'left'
        },
        {
          key: 'action',
          label: 'Action',
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
        .get(`/role/${this.id}/users`, {
          params
        })
        .then((response) => {
          this.items = response?.data?.data
          this.paginate = response?.data?.meta
          this.loadForm = false
        })
        .catch((error) => {
          this.$message.error(error?.response?.data?.message || this.$t('something-wrong'))
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
      // this.$inertia.visit(this.appRoute('admin.role.create'))
    },
    openDeleteForm(id) {
      this.$refs.deleteForm.open(id)
    },
    async deleteItem(userId) {
      await axios
        .delete(`/role/${this.id}/users/${userId}`)
        .then((response) => {
          this.$message.success(response?.data?.message)
          this.fetchData()
        })
        .catch((error) => {
          this.$message.error(error?.response?.data?.message || this.$t('something-wrong'))
        })
    },
    openShow(id) {
      this.$router.push({ name: 'user-show', params: { id } })
    }
  }
}
</script>
