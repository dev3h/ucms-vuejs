<template>
  <el-main>
    <el-table
      v-if="currentPermissions.length > 0"
      :data="currentPermissions"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      ref="tableRef"
    >
      <el-table-column
        type="selection"
        width="55"
      ></el-table-column>
      <el-table-column prop="action_name" label="Action Name" width="180" />
      <el-table-column prop="code" label="Permission Code" />
      <el-table-column label="Status" width="100">
        <template v-slot="scope">
          <el-tag v-if="scope.row.granted" type="success">Granted</el-tag>
          <el-tag v-else type="danger">Missing</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="100">
        <template v-slot="scope">
          <el-button v-if="!scope.row.granted" @click="grantPermission(scope.row)" size="small"
            >Grant</el-button
          >
          <el-button
            v-if="scope.row.granted"
            @click="revokePermission(scope.row)"
            size="small"
            type="danger"
            >Revoke</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <div v-if="currentPermissions.length > 0" style="margin-top: 20px">
      <el-button
        type="primary"
        @click="grantSelectedPermissions"
        :disabled="!selectedPermissionIds.length"
      >
        Grant Selected Permissions
      </el-button>
    </div>
  </el-main>
</template>

<script>
import { ElMessage } from 'element-plus'

export default {
  props: {
    currentPermissions: Array,
    selectedPermissionIds: Array,
    permissionStates: Object
  },
  data() {
    return {
      tableRef: null
    }
  },
  watch: {
    selectedPermissionIds: {
      handler(newVal) {
        this.$nextTick(() => {
          if (this.tableRef) {
            this.tableRef.clearSelection()
            newVal.forEach((id) => {
              const row = this.currentPermissions.find((perm) => perm.code === id)
              if (row) {
                this.tableRef.toggleRowSelection(row, true)
              }
            })
          }
        })
      },
      immediate: true
    }
  },
  methods: {
    handleSelectionChange(selection) {
      this.$emit(
        'update:selectedPermissionIds',
        selection.map((item) => item.code)
      )
    },
    grantPermission(permission) {
      permission.granted = true
      this.$set(this.permissionStates, permission.code, true)
      ElMessage.success(`Granted permission: ${permission.code}`)
    },
    revokePermission(permission) {
      permission.granted = false
      this.$set(this.permissionStates, permission.code, false)
      ElMessage.success(`Revoked permission: ${permission.code}`)
    },
    grantSelectedPermissions() {
      const selectedPermissions = this.selectedPermissionIds.map((code) => {
        return this.currentPermissions.find((p) => p.code === code)
      })

      selectedPermissions.forEach((permission) => {
        if (permission) {
          permission.granted = true
          this.$set(this.permissionStates, permission.code, true)
        }
      })

      ElMessage.success('Granted selected permissions')
      this.$emit('update:selectedPermissionIds', [])
    }
  },
   mounted() {
    this.tableRef = this.$refs.tableRef
  }
}
</script>

<style>
.el-table {
  margin-top: 20px;
}
</style>
