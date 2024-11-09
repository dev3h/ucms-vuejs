<template>
  <AdminLayout>
    <div class="w-full bg-white">
      <div class="w-full pt-3 pb-2 px-4">
        <BreadCrumbComponent :bread-crumb="setbreadCrumbHeader" />
      </div>
      <BackBar route-back="system" :title="titlePage">
        <template #actionBackBar>
          <div>
            <el-button class="w-[120px]" type="info" size="large" @click="goBack()">{{
              $t('button.cancel')
            }}</el-button>
            <el-button
              class="w-[120px]"
              type="primary"
              size="large"
              @click="doSubmit()"
              :loading="loadingForm"
            >
              {{ isEdit ? $t('button.update') : $t('button.add') }}
            </el-button>
          </div>
        </template>
      </BackBar>
      <div class="w-full px-4 mt-8 pb-8">
        <el-form
          class="w-full grid grid-col lg:grid-cols-2 gap-5"
          ref="form"
          :model="formData"
          :rules="rules"
          label-position="top"
        >
          <div class="col-span-1">
            <el-form-item
              :label="$t('column.common.name')"
              class="title--bold"
              prop="name"
              :error="getError('name')"
              :inline-message="hasError('name')"
            >
              <el-input
                :placeholder="$t('input.common.enter', { name: $t('column.common.name') })"
                size="large"
                v-model="formData.name"
                clearable
              />
            </el-form-item>
          </div>
          <div class="col-span-1">
            <el-form-item
              :label="$t('column.common.code')"
              class="title--bold"
              prop="code"
              :error="getError('code')"
              :inline-message="hasError('code')"
            >
              <el-input
                :disabled="isEdit"
                :placeholder="$t('input.common.enter', { name: $t('column.common.code') })"
                size="large"
                v-model="formData.code"
                clearable
              />
            </el-form-item>
          </div>
        </el-form>
        <div class="col-span-1 pl-1">
          <h4 class="font-bold text-sm">
            {{ $t('sidebar.permission') }} <span class="text-red-500">*</span>
          </h4>
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
                />
              </el-aside>
            </div>
            <div class="DataTable permission-table !flex-1">
              <el-table v-if="tableData.length > 0" :data="tableData" class="flex-1">
                <!-- Dòng đầu tiên: Tên của Module -->
                <el-table-column
                  :label="$t('sidebar.module')"
                  prop="module_name"
                  :span-method="spanMethod"
                ></el-table-column>

                <!-- Các dòng sau: Tên và checkbox của Action -->
                <el-table-column
                  v-for="(action, index) in actionColumns"
                  :key="index"
                  :label="action"
                >
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
                <el-table-column :label="$t('column.common.select-all')">
                  <template v-slot="scope">
                    <el-checkbox
                      :indeterminate="isIndeterminate(scope.row)"
                      :checked="isAllChecked(scope.row)"
                      @change="toggleAll(scope.row)"
                    >
                      {{ $t('column.common.select-all') }}
                    </el-checkbox>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import AdminLayout from '@/Layouts/AdminLayout.vue'
import BreadCrumbComponent from '@/components/Page/BreadCrumb.vue'
import { searchMenu } from '@/Mixins/breadcrumb.js'
import axios from '@/Plugins/axios'
import form from '@/Mixins/form.js'
import baseRuleValidate from '@/Store/Const/baseRuleValidate.js'
import BackBar from '@/components/BackBar/Index.vue'

export default {
  components: { AdminLayout, BreadCrumbComponent, BackBar },
  mixins: [form],
  data() {
    return {
      isEdit: false,
      formData: {
        id: this.$route.params.id,
        name: null,
        code: null,
        redirect_uris: ['']
      },
      actions: [],
      rules: {
        name: baseRuleValidate(this.$t)(this.$t('column.common.name')),
        code: baseRuleValidate(this.$t)(this.$t('column.common.code'))
      },
      loadingForm: false,
      filterText: '',
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      treeRef: null,
      tableData: [], // Dữ liệu bảng hiển thị cho subsystem
      actionColumns: [], // Cột action
      checkboxState: {}, // Trạng thái của các checkbox
      dataList: []
    }
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
          name: this.isEdit ? 'breadcrumb.edit-role' : 'breadcrumb.create-role',
          route: ''
        }
      ]
    },
    titlePage() {
      return this.isEdit ? this.$t('back-bar.edit-role') : this.$t('back-bar.create-role')
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
  async mounted() {
    if (this.formData.id) {
      this.isEdit = true
      await this.fetchData()
    }
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'role' })
    },
    async fetchData() {
      try {
        this.loadingForm = true
        await axios.get(`/system/${this.formData.id}`).then((response) => {
          if (response?.data?.status_code === 200) {
            const { id, name, code, redirect_uris } = response?.data?.data
            this.formData = {
              id,
              name,
              code,
              redirect_uris
            }
          }
          this.loadingForm = false
        })
      } catch (error) {
        this.loadingForm = false
        this.$message.error(error?.response?.data?.message || this.$t('message.something-wrong'))
      }
    },
    async submit() {
      this.loadingForm = true
      const { method, url } = this.prepareSubmit()
      await axios?.[method](url, this.formData).then((response) => {
        this.$message({
          type: response?.data?.status_code === 200 ? 'success' : 'error',
          message: response?.data?.message
        })
        if (response?.data?.status_code === 200) {
          this.$router.push({ name: 'system' })
        }
        this.loadingForm = false
      })
    },
    prepareSubmit() {
      return {
        method: this.isEdit ? 'put' : 'post',
        url: this.isEdit ? `/system/${this.formData.id}` : '/system'
      }
    },
    // Xử lý khi nhấp vào Subsystem
    async getPermission() {
      try {
        this.loadingForm = true
        const response = await axios.get("/role/permission-template")
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
                      permission_code: action?.permission_code,
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
                        is_direct: action.is_direct
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
<style></style>
