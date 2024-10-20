<template>
  <AdminLayout>
    <div class="w-full bg-white">
      <div class="w-full pt-3 pb-2 px-4">
        <BreadCrumbComponent :bread-crumb="setbreadCrumbHeader" />
      </div>
      <BackBar route-back="system" :title="item?.name">
       <template #actionBackBar>
          <div>
            <el-button class="w-[120px]" type="info" size="large" @click="goBack()">{{
              $t('button.cancel')
            }}</el-button>
            <el-button
              class="w-[120px]"
              type="primary"
              size="large"
              @click="updatePermission"
              :loading="loading"
            >
              {{ $t('button.update') }}
            </el-button>
          </div>
        </template>  
      </BackBar>
      <div class="w-full py-5 px-4 flex">
        <div class="w-[300px]">
          <el-aside class="w-full" style="background-color: #f5f7fa">
            <el-input
              v-model="filterText"
              :placeholder="$t('input.common.enter')"
              clearable
            ></el-input>
            <el-tree
              :data="treeData"
              :props="defaultProps"
              :filter-node-method="filterNode"
              @node-click="handleNodeClick"
              ref="treeRef"
              default-expand-all
              highlight-current
              :expand-on-click-node="false"
            />
          </el-aside>
        </div>
        <div class="DataTable permission-table !flex-1">
          <el-table v-if="tableData.length > 0" :data="tableData" class="flex-1">
            <!-- Dòng đầu tiên: Tên của Module -->
            <el-table-column
              label="Module"
              prop="module_name"
              :span-method="spanMethod"
            ></el-table-column>

            <!-- Các dòng sau: Tên và checkbox của Action -->
            <el-table-column v-for="(action, index) in actionColumns" :key="index" :label="action">
              <template v-slot="scope">
                <el-checkbox
                  v-if="scope.row.actions[index] !== undefined"
                  v-model="scope.row.actions[index]"
                  @change="
                    updateCheckboxState(scope.row.module_name, index, scope.row.actions[index])
                  "
                ></el-checkbox>
              </template>
            </el-table-column>

            <!-- Checkbox để chọn tất cả action của một module -->
            <el-table-column label="Select All">
              <template v-slot="scope">
                <el-checkbox
                  :indeterminate="isIndeterminate(scope.row)"
                  :checked="isAllChecked(scope.row)"
                  @change="toggleAll(scope.row)"
                >
                  Select All
                </el-checkbox>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import AdminLayout from '@/Layouts/AdminLayout.vue'
import BreadCrumbComponent from '@/components/Page/BreadCrumb.vue'
import { searchMenu } from '@/Mixins/breadcrumb.js'
import BackBar from '@/components/BackBar/Index.vue'
import axios from '@/Plugins/axios'

export default {
  components: { AdminLayout, BreadCrumbComponent, BackBar },
  data() {
    return {
      filterText: '',
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      loading: false,
      treeRef: null,
      tableData: [], // Dữ liệu bảng hiển thị cho subsystem
      actionColumns: [], // Cột action
      checkboxState: {}, // Trạng thái của các checkbox
      dataList: []
    }
  },
  created() {
    this.getPermission()
  },
  computed: {
    setbreadCrumbHeader() {
      let menuOrigin = searchMenu()
      return [
        {
          name: menuOrigin?.label,
          route: 'system'
        },
        {
          name: this.item?.name,
          route: '',
          isNoTranslate: true
        }
      ]
    }
  },
  watch: {
    filterText(val) {
      this.$refs.treeRef.filter(val)
    }
  },
  methods: {
     goBack() {
      this.$router.push({ name: 'user' })
    },
    // Xử lý khi nhấp vào Subsystem
    async getPermission() {
      try {
        this.loadingForm = true
        const response = await axios.get(`/user/${this.$route.params.id}/rest-permissions`)
        this.transformTree(response?.data?.data)
        this.transformDataList(response?.data?.data)
        this.loadingForm = false
      } catch (err) {
        this.loadingForm = false
        this.$message.error(err?.response?.data?.message || this.$t('message.something-wrong'))
      }
    },
    transformTree(data) {
      const tree = data?.map((system) => {
        return {
          id: system?.id,
          label: system?.name,
          type: 'system',
          code: system?.code,
          children: system?.subsystems?.map((subsystem) => {
            return {
              id: subsystem?.id,
              label: subsystem?.name,
              type: 'subsystem',
              code: subsystem?.code
            }
          })
        }
      })
      this.treeData = tree

      // Select the first subsystem by default
      this.$nextTick(() => {
        const firstSubsystem = this.treeData[0]?.children[0]
        if (firstSubsystem) {
          this.$refs.treeRef.setCurrentKey(firstSubsystem.code)
          this.populateTable(firstSubsystem)
        }
      })
    },
    transformDataList(data) {
      const transformDataList = data?.map((system) => {
        return {
          id: `SYSTEM_${system?.id}`,
          name: system?.name,
          type: 'system',
          code: system?.code,
          children: system?.subsystems?.map((subsystem) => {
            return {
              id: `SUBSYSTEM_${subsystem?.id}`,
              name: subsystem?.name,
              type: 'subsystem',
              code: subsystem?.code,
              children: subsystem?.modules?.map((module) => {
                return {
                  id: `MODULE_${module?.id}`,
                  name: module?.name,
                  type: 'module',
                  code: module?.code,
                  permissions: module?.actions?.map((action) => {
                    return {
                      id: `ACTION_${action?.id}`,
                      name: action?.name,
                      code: action?.code,
                      granted: action?.granted,
                      status: action?.status,
                      is_direct: action?.is_direct
                    }
                  })
                }
              })
            }
          })
        }
      })
      this.dataList = transformDataList
    },
    handleNodeClick(nodeData) {
      console.log(nodeData)
      if (nodeData.type === 'subsystem') {
        this.populateTable(nodeData)
      }
    },
    filterNode(value, data) {
      if (!value) return true
      return data.label.toLowerCase().includes(value.toLowerCase())
    },
    // Hàm để xử lý việc hiển thị các action trong bảng
    populateTable(subsystem) {
      this.tableData = []
      this.actionColumns = []

      const subsystemData = this.dataList
        .find((system) => system.children.some((sub) => sub.code === subsystem.code))
        ?.children.find((sub) => sub.code === subsystem.code)

      if (subsystemData) {
        subsystemData.children.forEach((module) => {
          const moduleData = {
            module_name: module.name,
            actions: new Array(this.actionColumns.length).fill(undefined)
          }

          module.permissions.forEach((perm) => {
            if (!this.actionColumns.includes(perm.name)) {
              this.actionColumns.push(perm.name)
            }
            const actionIndex = this.actionColumns.indexOf(perm.name)
            moduleData.actions[actionIndex] =
              this.checkboxState[module.name]?.[actionIndex] ?? perm.granted
          })

          this.tableData.push(moduleData)
        })
      }
    },
    // Cập nhật trạng thái của checkbox
    updateCheckboxState(moduleName, actionIndex, value) {
      if (!this.checkboxState[moduleName]) {
        this.checkboxState[moduleName] = {}
      }
      this.checkboxState[moduleName][actionIndex] = value
    },
    // Hàm span để dòng đầu tiên là tên của module
    spanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0 && rowIndex === 0) {
        return [1, this.actionColumns.length + 2] // span toàn bộ cột
      }
    },
    // Kiểm tra checkbox "Select All" có được chọn không
    isAllChecked(row) {
      return row.actions.every((action) => action)
    },
    // Kiểm tra trạng thái indeterminate của checkbox "Select All"
    isIndeterminate(row) {
      const checkedCount = row.actions.filter(Boolean).length
      return checkedCount > 0 && checkedCount < row.actions.length
    },
    // Toggle chọn tất cả action của module
    toggleAll(row) {
      const allChecked = this.isAllChecked(row)
      row.actions = row.actions.map(() => !allChecked)
      this.updateCheckboxState(row.module_name, null, !allChecked)
    },
    updatePermission() {
      console.log(this.actionColumns)
    }
  }
}
</script>

<style>
.el-tree {
  height: calc(100vh - 50px);
  overflow-y: auto;
}
.permission-table .el-table {
  width: 100% !important;
  max-width: 100% !important;
}
</style>
