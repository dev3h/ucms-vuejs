<template>
  <el-row :gutter="16">
    <el-col :span="8">
      <el-card>
        <el-statistic :title="$t('sidebar.user')" :value="statistic.totalUsers" />
      </el-card>
    </el-col>
    <el-col :span="8">
      <el-card>
        <el-statistic :title="$t('sidebar.role')" :value="statistic.totalRoles" />
      </el-card>
    </el-col>
    <el-col :span="8">
      <el-card>
        <el-statistic :title="$t('sidebar.system')" :value="statistic.totalSystems" />
      </el-card>
    </el-col>
    
  </el-row>
</template>

<script>
import axios from '@/Plugins/axios'

export default {
  data() {
    return {
      statistic: {
        totalUsers: 0,
        totalSystems: 0,
        totalRoles: 0
      }
    }
  },
  async created() {
    await this.fetchData()
  },
  methods: {
    async fetchData() {
      try {
        const response = await axios.get('/dashboard/get-statistic')
        console.log(response)
        this.statistic = {
          totalUsers: response?.data?.data?.totalUsers || 0,
          totalSystems: response?.data?.data?.totalSystems || 0,
          totalRoles: response?.data?.data?.totalRoles || 0
        }
      } catch (error) {
        this.$message({
          type: 'error',
          message: error.response.data.message || this.$t('something-wrong')
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
