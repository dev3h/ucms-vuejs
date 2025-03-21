<template>
  <div>
    <div class="w-full">
      <div class="w-full flex justify-between items-center my-2">
        <div class="flex gap-1">
          <el-input
            v-model="filters.search"
            class="!w-[250px]"
            size="large"
            :placeholder="$t('input.common.search')"
            clearable
            @input="filterData"
          >
            <template #prefix>
              <img src="/images/svg/search-icon.svg" alt="" />
            </template>
          </el-input>
          <!-- <el-button type="primary" size="large">Xem dưới dạng cây</el-button> -->
        </div>
        <div class="flex justify-end w-full">
          <el-button type="warning" size="large" @click="openIgnore(id)">{{
            $t('button.ignore-permission-in-role')
          }}</el-button>
          <el-button type="primary" size="large" @click="openAssign(id)">{{
            $t('button.assign-permission')
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
        @size-change="changeSize"
      >
        <!-- <template #action="{ row }">
          <div class="flex justify-center items-center gap-x-[12px]">
            <div class="cursor-pointer" @click="openDeleteForm(row?.id)">
              <img src="/images/svg/trash-icon.svg" />
            </div>
          </div>
        </template> -->
      </DataTable>
    </div>
    <ModalAssign ref="modalAssign" @assign-success="fetchData" />
    <ModalIgnore ref="modalIgnore" @ignore-success="fetchData" />
  </div>
</template>

<script>
import DataTable from '@/components/Page/DataTable.vue'
import axios from '@/Plugins/axios'
import DeleteForm from '@/components/Page/DeleteForm.vue'
import debounce from 'lodash.debounce'
import ModalAssign from './ModalAssign.vue'
import ModalIgnore from './ModalIgnore.vue'
export default {
  components: { ModalIgnore, ModalAssign, DataTable, DeleteForm },
  data() {
    return {
      items: [],
      filters: {
        page: Number(this.$route.params?.page ?? 1),
        limit: Number(this?.$route?.query?.limit ?? 10)
      },
      id: this.$route.params?.id,
      fields: [
        {
          key: 'code',
          'min-width': 400,
          label: this.$t('column.common.code'),
          align: 'left',
          headerAlign: 'left'
        },
        // {
        //   key: 'action',
        //   label: '',
        //   align: 'center',
        //   headerAlign: 'center',
        //   fixed: 'right',
        //   width: 200
        // }
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
        .get(`user/${this.id}/all-permissions`, {params})
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
        .delete('user-revoke-permission', {
          id: this.id,
          permission_id: permissionId
        })
        .then((response) => {
          this.$message.success(response?.data?.message)
          this.fetchData()
        })
        .catch((error) => {
          this.$message.error(error?.response?.data?.message)
        })
    },
    changeSize(value) {
      this.filters.page = 1
      this.filters.limit = value
      this.fetchData()
    }
  }
}
</script>
