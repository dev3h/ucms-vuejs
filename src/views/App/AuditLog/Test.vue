<template>
  <AdminLayout>
    <div class="w-full bg-white px-4">
      <div class="w-full pt-3 pb-2">
        <BreadCrumbComponent :bread-crumb="setbreadCrumbHeader" />
      </div>
      <div class="flex items-center gap-3 mb-4">
        <el-button
          :disabled="dateRange?.length === 2"
          :type="selectedRange === 'week' ? 'primary' : 'default'"
          @click="selectRange('week')"
        >
          This Week
        </el-button>
        <el-button
          :disabled="dateRange?.length === 2"
          :type="selectedRange === 'month' ? 'primary' : 'default'"
          @click="selectRange('month')"
        >
          This Month
        </el-button>
        <el-button
          :disabled="dateRange?.length === 2"
          :type="selectedRange === 'year' ? 'primary' : 'default'"
          @click="selectRange('year')"
        >
          This Year
        </el-button>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="to"
          start-placeholder="From"
          end-placeholder="To"
          @change="selectRange('daterange')"
          @clear="selectRange('week')"
        />
      </div>
      <div>
        <v-chart ref="chart" :option="chartOptions" autoresize style="height: 400px" />
      </div>
      <TableLog />
    </div>
  </AdminLayout>
</template>

<script>
import AdminLayout from '@/Layouts/AdminLayout.vue'
import BreadCrumbComponent from '@/components/Page/BreadCrumb.vue'
import VChart from 'vue-echarts'
import 'echarts'
import { searchMenu } from '@/Mixins/breadcrumb.js'
import TableLog from './TableLog.vue'
import axios from '@/Plugins/axios'

export default {
  components: {
    VChart,
    AdminLayout,
    BreadCrumbComponent,
    TableLog
  },
  data() {
    return {
      selectedRange: 'week', // Default selection state
      dateRange: [],
      chartOptions: {
        tooltip: { trigger: 'axis' },
        legend: { data: ['Debug', 'Info', 'Warning', 'Error', 'Critical'] },
        xAxis: { type: 'category', data: [] },
        yAxis: { type: 'value' },
        series: [
          { name: 'Debug', type: 'bar', stack: 'logs', data: [], itemStyle: { color: '#4A90E2' } },
          { name: 'Info', type: 'bar', stack: 'logs', data: [], itemStyle: { color: '#7ED321' } },
          {
            name: 'Warning',
            type: 'bar',
            stack: 'logs',
            data: [],
            itemStyle: { color: '#F5A623' }
          },
          { name: 'Error', type: 'bar', stack: 'logs', data: [], itemStyle: { color: '#D0021B' } },
          {
            name: 'Critical',
            type: 'bar',
            stack: 'logs',
            data: [],
            itemStyle: { color: '#BD10E0' }
          }
        ]
      }
    }
  },
  computed: {
    setbreadCrumbHeader() {
      let menuOrigin = searchMenu()
      return [{ name: menuOrigin?.label, route: 'audit-log' }]
    }
  },
  watch: {
    dateRange: {
      handler(val) {
        if (val === null) {
          this.selectRange('week')
        }
      },
      deep: true
    }
  },
  methods: {
    async selectRange(range) {
      this.selectedRange = range

      let xAxisData = []
      let seriesData = null
      let params = { range }

      // Handle daterange specific logic
      if (range === 'daterange' && this.dateRange.length === 2) {
        const startDate = this.dateRange[0]
        const endDate = this.dateRange[1]
        params.start_date = startDate
        params.end_date = endDate

        const daysDiff = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
        xAxisData = Array.from({ length: daysDiff + 1 }, (_, i) => {
          const date = new Date(startDate)
          date.setDate(date.getDate() + i)
          return date.toISOString().split('T')[0]
        })
      } else {
        // Default ranges for week, month, and year
        if (range === 'week') {
          xAxisData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        } else if (range === 'month') {
          xAxisData = Array.from({ length: 30 }, (_, i) => `${i + 1}`)
        } else if (range === 'year') {
          xAxisData = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec'
          ]
        }

        // If no daterange, we use the range for the API request
        params.range = range
      }

      // Fetch data from the API based on the selected range and date range parameters
      try {
        const response = await axios.get('/log/chart-data', { params })
        // Parse the response to update the chart
        seriesData = [
          response.data.series.debug,
          response.data.series.info,
          response.data.series.warning,
          response.data.series.error,
          response.data.series.critical
        ]

        // Update the chart with actual data
        this.updateChartOptions(xAxisData, seriesData)
      } catch (error) {
        console.error('Error fetching chart data:', error)
      }
    },
    updateChartOptions(xAxisData, seriesData) {
      this.chartOptions = {
        ...this.chartOptions,
        xAxis: {
          ...this.chartOptions.xAxis,
          data: xAxisData,
          axisLabel: {
            interval: 0,
            rotate: this.selectRange === 'daterange' ? 45 : 0
          }
        },
        series: this.chartOptions.series.map((series, index) => ({
          ...series,
          data: seriesData[index]
        }))
      }
    },
    generateRandomData(dataLength) {
      return [
        Array.from({ length: dataLength }, () => Math.floor(Math.random() * 2000)),
        Array.from({ length: dataLength }, () => Math.floor(Math.random() * 1500)),
        Array.from({ length: dataLength }, () => Math.floor(Math.random() * 1000)),
        Array.from({ length: dataLength }, () => Math.floor(Math.random() * 500)),
        Array.from({ length: dataLength }, () => Math.floor(Math.random() * 200))
      ]
    }
  },
  mounted() {
    this.selectRange('week') // Set default to 'This Week'
  }
}
</script>

<style scoped>
.vue-slider {
  margin-top: 20px;
  width: 100%;
}
</style>
