<template>
  <AdminLayout>
    <div class="w-full bg-white">
      <div class="w-full pt-3 pb-2 px-4">
        <BreadCrumbComponent :bread-crumb="setbreadCrumbHeader" />
      </div>
      <BackBar route-back="system" :title="item?.name"> </BackBar>
      <div class="w-full py-5 px-4 flex">
        <el-aside width="300px" style="background-color: #f5f7fa">
          <el-input v-model="filterText" placeholder="Search system/module..." clearable></el-input>
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
        <div class="DataTable w-full">
          <el-table v-if="tableData.length > 0" :data="tableData" class="flex-1" style="width: 100%">
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
import { treeData as dataList } from './fakeData'
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
      treeRef: null,
      tableData: [], // Dữ liệu bảng hiển thị cho subsystem
      actionColumns: [], // Cột action
      checkboxState: {} // Trạng thái của các checkbox
    }
  },
  created() {
    const tree = dataList.map((system) => {
      return {
        label: system?.name,
        type: system?.type,
        code: system?.code,
        children: system?.children?.map((subsystem) => {
          return {
            label: subsystem?.name,
            type: subsystem?.type,
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
    // Xử lý khi nhấp vào Subsystem
    handleNodeClick(nodeData) {
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

      const subsystemData = dataList
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
    }
  }
}
</script>

<style>
.el-tree {
  height: calc(100vh - 50px);
  overflow-y: auto;
}
.el-table {
  margin-top: 20px;
}
</style>
