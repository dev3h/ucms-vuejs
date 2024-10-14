<template>
  <el-container style="height: 100vh">
    <el-header style="background-color: #f5f7fa; padding: 20px">
      <el-button type="warning" @click="logCheckedPermissions"> Log Checked Permissions </el-button>
    </el-header>

    <el-container>
      <TreeView
        :treeData="treeData"
        :defaultProps="defaultProps"
        :filterText="filterText"
        @node-click="handleNodeClick"
        @update:filterText="filterText = $event"
      />
      <PermissionTable
        :currentPermissions="currentPermissions"
        :selectedPermissionIds="selectedPermissionIds"
        :permissionStates="permissionStates"
        @update:selectedPermissionIds="selectedPermissionIds = $event"
      />
    </el-container>
  </el-container>
</template>

<script>
import TreeView from './TreeView.vue'
import PermissionTable from './PermissionTable.vue'

export default {
  components: {
    TreeView,
    PermissionTable
  },
  data() {
    return {
      filterText: '',
      treeData: [
        {
          label: 'System A',
          children: [
            {
              label: 'Subsystem A1',
              children: [
                {
                  label: 'Module M1',
                  permission: [
                    {
                      action_name: 'Action 1',
                      granted: true,
                      code: 'systemA-subsystemA1-moduleM1-action1'
                    },
                    {
                      action_name: 'Action 2',
                      granted: false,
                      code: 'systemA-subsystemA1-moduleM1-action2'
                    }
                  ]
                },
                {
                  label: 'Module M2',
                  permission: [
                    {
                      action_name: 'Action 3',
                      granted: false,
                      code: 'systemA-subsystemA1-moduleM2-action3'
                    }
                  ]
                }
              ]
            },
            {
              label: 'Subsystem A2',
              children: [
                {
                  label: 'Module M3',
                  permission: [
                    {
                      action_name: 'Action 4',
                      granted: false,
                      code: 'systemA-subsystemA2-moduleM3-action4'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      currentPermissions: [],
      selectedPermissionIds: [],
      permissionStates: {} // Đối tượng lưu trữ trạng thái
    }
  },
  methods: {
    handleNodeClick(nodeData) {
      const applyPermissionStates = (permissions) => {
        permissions.forEach((perm) => {
          if (this.permissionStates.hasOwnProperty(perm.code)) {
            perm.granted = this.permissionStates[perm.code]
          }
        })
      }

      const collectPermissions = (node) => {
        let permissions = []
        if (node.children && node.children.length) {
          node.children.forEach((child) => {
            permissions = permissions.concat(collectPermissions(child))
          })
        } else if (node.permission) {
          permissions = permissions.concat(node.permission)
        }
        return permissions
      }

      const newPermissions = collectPermissions(nodeData)
      // applyPermissionStates(newPermissions)

      // Giữ nguyên các permission đã được check từ trước
      const selectedPermissions = newPermissions.filter((perm) => perm.granted)
      this.selectedPermissionIds = selectedPermissions.map((perm) => perm.code)
      console.log(this.selectedPermissionIds)

      this.currentPermissions = newPermissions
    },
    logCheckedPermissions() {
      const checkedPermissions = this.selectedPermissionIds.map((code) => {
        return this.currentPermissions.find((p) => p.code === code)
      })

      console.log('Checked Permissions:', checkedPermissions)
    }
  }
}
</script>
