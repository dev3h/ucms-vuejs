<template>
  <div class="flex w-full">
    <!-- Left Side: Date-Time Logs -->
    <div class="w-[200px] p-4 border-r border-gray-300">
      <!-- <h3 class="text-lg font-bold mb-4">Date-Time Logs</h3> -->
      <ul class="space-y-2">
        <li
          v-for="date in dateTimeLogs"
          :key="date"
          class="cursor-pointer hover:bg-gray-100 p-2 rounded flex justify-between items-center"
          :class="{ 'bg-blue-100': date === selectedDate }"
          @click="selectDate(date)"
        >
          <span>{{ date }}</span>
          <!-- Dropdown button -->
          <!-- <el-dropdown trigger="click" class="float-right">
            <el-button size="small" type="text">
              click
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click="deleteLogByDate(date)">Xóa</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown> -->
          <el-dropdown trigger="contextmenu">
            <span class="el-dropdown-link font-bold text-lg"> 
             <img src="/images/svg/ellipse.svg" class='w-5 h-5' /> 
            </span>
            <template #dropdown>
              <el-dropdown-menu class="w-[200px]">
                <el-dropdown-item @click="deleteLogByDate(date)">
                  <span class="!px-5">Xóa</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </li>
      </ul>
    </div>

    <!-- Right Side: Log Table -->
    <div class="flex-1 p-4">
      <!-- <div class="w-full flex flex-wrap justify-between gap-2 my-2">
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
      </div> -->

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
          <div class="pl-5 flex flex-col gap-2">
            <p v-for="(value, key) in row" :key="key">
              <strong>{{ key }}:</strong> {{ value }}
            </p>
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
  emits: ['delete-success'],
  data() {
    return {
      dateTimeLogs: [], // Holds unique date-time logs
      selectedDate: null, // Currently selected date-time
      items: [],
      filters: {
        page: Number(this?.$route?.params?.page ?? 1),
        limit: Number(this?.$route?.query?.limit ?? 10),
        search: '',
        created_at: null
      },
      fields: [
        { key: 'level', label: 'Cấp độ', 'min-width': 200, align: 'left', headerAlign: 'left' },
        {
          key: 'created_at',
          label: this.$t('column.time'),
          width: 200,
          align: 'left',
          headerAlign: 'left'
        },
        {
          key: 'ip_address',
          label: this.$t('column.ip'),
          'min-width': 200,
          align: 'left',
          headerAlign: 'left'
        },
        {
          key: 'status_code',
          label: this.$t('column.status-code'),
          width: 200,
          align: 'left',
          headerAlign: 'left'
        },
        {
          key: 'message',
          label: this.$t('column.message'),
          'min-width': 200,
          align: 'left',
          headerAlign: 'left'
        }
      ],
      paginate: {},
      loadForm: false
    }
  },
  async created() {
    await this.fetchDateTimeLogs()
    this.fetchData()
  },
  methods: {
    async fetchDateTimeLogs() {
      try {
        const response = await axios.get('/log/date-times-logs')
        this.dateTimeLogs = response?.data?.data // Assuming the response is an array of dates
        this.selectedDate = this.dateTimeLogs[0] || null
      } catch (error) {
        this.$message.error(error?.response?.data?.message)
      }
    },
    async fetchData(page = 1) {
      this.loadForm = true
      this.filters.page = page

      const params = { ...this.filters }
      if (this.selectedDate) {
        params.created_at = this.selectedDate // Filter by selected date
      }

      try {
        const response = await axios.get('/log', { params })
        this.items = response?.data?.data
        this.paginate = response?.data?.meta
      } catch (error) {
        this.$message.error(error?.response?.data?.message)
      } finally {
        this.loadForm = false
      }
    },
    selectDate(date) {
      this.selectedDate = date
      this.filters.page = 1 // Reset to the first page
      this.fetchData()
    },
    filterData: debounce(function () {
      this.fetchData()
    }, 500),
    changePage(page) {
      this.fetchData(page)
    },
    changeSize(value) {
      this.filters.page = 1
      this.filters.limit = value
      this.fetchData()
    },
    async deleteLogByDate(date) {
      await axios
        .delete(`/log/${date}`)
        .then((response) => {
          this.$message.success(response?.data?.message)
          Promise.all([this.fetchData(), this.fetchDateTimeLogs()])
          this.$emit('delete-success')
        })
        .catch((error) => {
          this.$message.error(error?.response?.data?.message)
        })
    }
  }
}
</script>

<style lang="scss" scoped></style>
