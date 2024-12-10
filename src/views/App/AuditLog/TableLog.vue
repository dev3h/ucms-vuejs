<template>
  <div class="w-full">
    <div class="w-full flex flex-wrap justify-between gap-2 my-2">
      <div class="flex flex-wrap gap-2">
        <div class="col-span-1">
          <el-input
            v-model="filters.search"
            class="!w-80"
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
        <div class="flex-col">
          <el-date-picker
            v-model="filters.created_at"
            type="date"
            :placeholder="$t('column.common.created-at')"
            size="large"
            class="!w-[185px]"
            value-format="YYYY-MM-DD"
            format="YYYY/MM/DD"
            @change="filterData"
          />
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
      :enableExpand="true"
      footer-center
      paginate-background
      @page-change="changePage"
      @size-change="changeSize"
    >
      <template #expand="{ row }">
        <div>
          <p>{{ row }}</p>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script>
import DataTable from '@/components/Page/DataTable.vue'
import axios from '@/Plugins/axios'
import debounce from 'lodash.debounce'

export default {
  components: { DataTable },
  data() {
    return {
      items: [],
      filters: {
        page: Number(this?.$route?.params?.page ?? 1),
        limit: Number(this?.$route?.query?.limit ?? 10)
      },
      fields: [
        {
          key: 'level',
          'min-width': 200,
          label: 'Cấp độ',
          align: 'left',
          headerAlign: 'left'
        },
        {
          key: 'created_at',
          'min-width': 200,
          label: this.$t('column.time'),
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
          key: 'actor',
          'min-width': 400,
          label: this.$t('column.actor'),
          align: 'left',
          headerAlign: 'left'
        },
        {
          key: 'target',
          'min-width': 400,
          label: 'Kết quả',
          align: 'left',
          headerAlign: 'left'
        },
        {
          key: 'target',
          'min-width': 400,
          label: 'Trạng thái',
          align: 'left',
          headerAlign: 'left'
        },
        {
          key: 'target',
          'min-width': 400,
          label: 'GeoIP',
          align: 'left',
          headerAlign: 'left'
        },
        {
          key: 'target',
          'min-width': 400,
          label: 'Số lần lặp lại',
          align: 'left',
          headerAlign: 'left'
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
        .get('/log', { params })
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
    changeSize(value) {
      this.filters.page = 1
      this.filters.limit = value
      this.fetchData()
    }
  }
}
</script>

<style lang="scss" scoped></style>
