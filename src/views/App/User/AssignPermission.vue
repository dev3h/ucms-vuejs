<template>
  <div class="w-full bg-white">
    <div class="bg-grayF5 py-[10px] px-4 flex items-center justify-end h-14">
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
    </div>
    <div class="w-full pb-5 pr-4 flex border">
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
            node-key="code"
          />
        </el-aside>
      </div>
      <el-table class="permission-table" v-if="tableData.length > 0" :data="tableData">
        <!-- Dòng đầu tiên: Tên của Module -->
        <el-table-column
          :label="$t('sidebar.module')"
          prop="module_name"
          :span-method="spanMethod"
          fixed="left"
          min-width="120"
        ></el-table-column>

        <!-- Các dòng sau: Tên và checkbox của Action -->
        <el-table-column
          min-width="120"
          v-for="(action, index) in actionColumns"
          :key="index"
          :label="action?.name"
        >
          <template v-slot="scope">
            <el-checkbox
              :disabled="!action?.is_exist"
              v-if="scope.row.actions[index] !== undefined"
              v-model="scope.row.actions[index]"
              @change="updateCheckboxState(scope.row.module_name, index, scope.row.actions[index])"
            ></el-checkbox>
          </template>
        </el-table-column>

        <!-- Checkbox để chọn tất cả action của một module -->
        <el-table-column
          :label="$t('column.common.select-all')"
          width="120"
          header-align="center"
          align="center"
          fixed="right"
        >
          <template v-slot="scope">
            <el-checkbox
              :indeterminate="isIndeterminate(scope.row)"
              :checked="isAllChecked(scope.row)"
              @change="toggleAll(scope.row)"
            >
            </el-checkbox>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import axios from '@/Plugins/axios'

export default {
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
          this.$refs.treeRef.setCurrentKey(firstSubsystem?.code)
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
                      permission_code: action?.permission_code,
                      granted: action?.granted,
                      status: action?.status,
                      is_direct: action?.is_direct,
                      is_exist: action?.is_exist
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
            if (!this.actionColumns.some((action) => action?.name === perm?.name)) {
              this.actionColumns.push({ name: perm.name, is_exist: perm?.is_exist })
            }
            const actionIndex = this.actionColumns.findIndex(action => action.name === perm.name);
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
    async updatePermission() {
      try {
        const updatedPermissions = this.dataList.map((system) => {
          return {
            id: system.id,
            name: system.name,
            type: system.type,
            code: system.code,
            subsystems: system.children.map((subsystem) => {
              return {
                id: subsystem.id,
                name: subsystem.name,
                type: subsystem.type,
                code: subsystem.code,
                modules: subsystem.children.map((module) => {
                  return {
                    id: module.id,
                    name: module.name,
                    type: module.type,
                    code: module.code,
                    actions: module.permissions.map((action, index) => {
                      return {
                        id: action.id,
                        name: action.name,
                        code: action.code,
                        permission_code: action.permission_code,
                        granted: this.checkboxState[module.name]?.[index] ?? action.granted,
                        status: action.status,
                        is_direct: action.is_direct,
                        is_exist: action.is_exist
                      }
                    })
                  }
                })
              }
            })
          }
        })

        const response = await axios.post(
          `/user/${this.$route.params.id}/update-permission`,
          updatedPermissions
        )
        this.$message({
          type: response?.data?.status_code === 200 ? 'success' : 'error',
          message: response?.data?.message
        })
        if (response?.data?.status_code === 200) {
          this.getPermission()
        }
      } catch (err) {
        this.$message.error(err?.response?.data?.message || this.$t('message.something-wrong'))
      }
    }
  }
}
</script>

<style>
.el-tree {
  height: calc(100vh - 50px);
  overflow-y: auto;
}
</style>
