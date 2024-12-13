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
          {{ $t('button.this-week') }}
        </el-button>
        <el-button
          :disabled="dateRange?.length === 2"
          :type="selectedRange === 'month' ? 'primary' : 'default'"
          @click="selectRange('month')"
        >
          {{ $t('button.this-month') }}
        </el-button>
        <el-button
          :disabled="dateRange?.length === 2"
          :type="selectedRange === 'year' ? 'primary' : 'default'"
          @click="selectRange('year')"
        >
          {{ $t('button.this-year') }}
        </el-button>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="~"
          value-format="YYYY-MM-DD"
          format="YYYY/MM/DD"
          :start-placeholder="$t('input.from-date')"
          :end-placeholder="$t('input.to-date')"
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
          { name: 'Info', type: 'bar', stack: 'logs', data: [], itemStyle: { color: '#9EDF9C' } },
          {
            name: 'Warning',
            type: 'bar',
            stack: 'logs',
            data: [],
            itemStyle: { color: '#FFE31A' }
          },
          { name: 'Error', type: 'bar', stack: 'logs', data: [], itemStyle: { color: '#FF2929' } },
          {
            name: 'Critical',
            type: 'bar',
            stack: 'logs',
            data: [],
            itemStyle: { color: '#740938' }
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
      } else if (range === 'month') {
        const now = new Date()
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        xAxisData = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`)
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
      } else if (range === 'week') {
        xAxisData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      }

      try {
        const response = await axios.get('/log/chart-data', { params })
        const apiData = response.data

        // Handle series data based on range
        if (range === 'month') {
          seriesData = this.fillMissingData(apiData.xAxis, apiData.series)
          console.log(seriesData)
        } else if (range === 'year') {
          seriesData = this.fillMissingMonths(apiData.xAxis, apiData.series)
        } else if (range === 'week') {
          seriesData = this.fillMissingDays(apiData.xAxis, apiData.series)
        } else {
          console.log(apiData)
          seriesData = this.fillMissingRanges(apiData.xAxis, apiData.series)
        }

        this.updateChartOptions(xAxisData, seriesData)
      } catch (error) {
        console.error('Error fetching chart data:', error)
      }
    },

    fillMissingData(dates, series) {
      const now = new Date()
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      const currentMonth = new Date().getMonth()
      const daysArray = Array.from({ length: daysInMonth }, (_, day) => {
        const dayFormat = (day + 1).toString().padStart(2, '0') // Format day as "01", "02", etc.
        const month = currentMonth + 1
        return `${month}-${dayFormat}`
      }) // Generate array [1, 2, ..., daysInMonth]

      return Object.keys(series).reduce((result, key) => {
        const filledData = daysArray.map((dayKey) => {
          // If the day exists in the series, use its value; otherwise, default to 0
          const dayIndex = dates.findIndex((date) => date === dayKey)
          return dayIndex !== -1 ? series[key][dayIndex] || 0 : 0
        })

        result[key] = filledData // Assign the filled data to the series key
        return result
      }, {})
    },

    fillMissingMonths(dates, series) {
      const currentYear = new Date().getFullYear()
      // Generate all months in the year as "YYYY-MM"
      const monthsInYear = Array.from({ length: 12 }, (_, i) => {
        const month = (i + 1).toString().padStart(2, '0') // Format month as "01", "02", etc.
        return `${currentYear}-${month}`
      })

      // Process the series and fill missing months
      return Object.keys(series).reduce((result, key) => {
        const filledData = monthsInYear.map((monthKey) => {
          // If the month exists, take the series value; otherwise, default to 0
          const monthIndex = dates.findIndex((date) => date === monthKey)
          return monthIndex !== -1 ? series[key][monthIndex] || 0 : 0
        })

        result[key] = filledData // Assign the filled data to the series key
        return result
      }, {})
    },

    fillMissingDays(dates, series) {
      const daysInWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      return Object.keys(series).reduce((result, key) => {
        const filledData = daysInWeek.map((dayKey) => {
          // If the day exists, take the series value; otherwise, default to 0
          const dayIndex = dates.findIndex((date) => date === dayKey)
          return dayIndex !== -1 ? series[key][dayIndex] || 0 : 0
        })

        result[key] = filledData // Assign the filled data to the series key
        return result
      }, {})
    },
    fillMissingRanges(dates, series) {
      const [startDate, endDate] = this.dateRange

      // Helper function to generate all dates in the range
      const generateDateRange = (start, end) => {
        const range = []
        let currentDate = new Date(start)

        while (currentDate <= new Date(end)) {
          range.push(currentDate.toISOString().split('T')[0]) // Format as "YYYY-MM-DD"
          currentDate.setDate(currentDate.getDate() + 1) // Increment by 1 day
        }

        return range
      }

      // Generate all dates in the range
      const allDates = generateDateRange(startDate, endDate)

      // Process the series and fill missing dates
      return Object.keys(series).reduce((result, key) => {
        const filledData = allDates.map((dateKey) => {
          // Find the index of the date in the provided `dates`
          const dateIndex = dates.findIndex((date) => date === dateKey)
          return dateIndex !== -1 ? series[key][dateIndex] || 0 : 0 // Default to 0 if missing
        })

        result[key] = filledData // Assign the filled data to the series key
        return result
      }, {})
    },

    updateChartOptions(xAxisData, seriesData) {
      this.chartOptions = {
        ...this.chartOptions,
        xAxis: {
          ...this.chartOptions.xAxis,
          data: xAxisData,
          axisLabel: {
            interval: 0,
            rotate: this.selectedRange === 'daterange' ? 45 : 0
          }
        },
        series: this.chartOptions.series.map((series) => {
          return {
            ...series,
            data: seriesData[series?.name?.toLowerCase()]
          }
        })
      }
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
