<template>
  <el-container style="height: 100vh;">
    <!-- Sidebar trái: Tree view -->
    <el-aside width="300px" style="background-color: #f5f7fa;">
      <el-input v-model="filterText" placeholder="Search system/module..." clearable></el-input>
      <el-tree
        :data="treeData"
        :props="defaultProps"
        :filter-node-method="filterNode"
        @node-click="handleNodeClick"
        ref="tree"
        default-expand-all
        highlight-current
      />
    </el-aside>

    <!-- Bảng chi tiết quyền: Main content -->
    <el-main>
      <el-table v-if="currentPermissions.length > 0" :data="currentPermissions" style="width: 100%">
        <el-table-column type="selection" v-model="selectedPermissionIds" width="55"></el-table-column>
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
            <el-button v-if="!scope.row.granted" @click="grantPermission(scope.row)" size="small">Grant</el-button>
            <el-button v-if="scope.row.granted" @click="revokePermission(scope.row)" size="small" type="danger">Revoke</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Nút gán quyền đã chọn -->
      <div v-if="currentPermissions.length > 0" style="margin-top: 20px;">
        <el-button type="primary" @click="grantSelectedPermissions" :disabled="!selectedPermissionIds.length">
          Grant Selected Permissions
        </el-button>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';

export default {
  setup() {
    const filterText = ref('');
    const treeData = ref([
      {
        label: 'System A',
        children: [
          {
            label: 'Subsystem A1',
            children: [
              {
                label: 'Module M1',
                permission: [
                  { action_name: 'Action 1', granted: true, code: 'systemA-subsystemA1-moduleM1-action1' },
                  { action_name: 'Action 2', granted: false, code: 'systemA-subsystemA1-moduleM1-action2' }
                ]
              },
              {
                label: 'Module M2',
                permission: [
                  { action_name: 'Action 3', granted: false, code: 'systemA-subsystemA1-moduleM2-action3' }
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
                  { action_name: 'Action 4', granted: false, code: 'systemA-subsystemA2-moduleM3-action4' }
                ]
              }
            ]
          }
        ]
      }
    ]);

    const defaultProps = reactive({
      children: 'children',
      label: 'label'
    });

    const currentPermissions = ref([]);
    const selectedPermissionIds = ref([]);

    const filterNode = (value, data) => {
      if (!value) return true;
      return data.label.toLowerCase().includes(value.toLowerCase());
    };

    const handleNodeClick = (nodeData) => {
      // Xóa danh sách quyền đã chọn khi nhấp vào một node khác
      selectedPermissionIds.value = [];

      // Hiển thị tất cả quyền trong node system
      if (nodeData.children && nodeData.children.length) {
        currentPermissions.value = [];
        nodeData.children.forEach((subsystem) => {
          if (subsystem.children) {
            subsystem.children.forEach((module) => {
              if (module.permission) {
                currentPermissions.value.push(...module.permission);
              }
            });
          }
        });
      }
      // Khi nhấp vào subsystem, hiển thị tất cả quyền của tất cả các mô-đun trong subsystem đó
      else if (nodeData.children) {
        currentPermissions.value = [];
        nodeData.children.forEach((module) => {
          if (module.permission) {
            currentPermissions.value.push(...module.permission);
          }
        });
      }
      // Khi nhấp vào một mô-đun, hiển thị tất cả quyền trong module đó
      else if (nodeData.permission) {
        currentPermissions.value = nodeData.permission;
      } else {
        currentPermissions.value = [];
      }
    };

    const grantPermission = (permission) => {
      permission.granted = true;
      ElMessage.success(`Granted permission: ${permission.code}`);
    };

    const revokePermission = (permission) => {
      permission.granted = false;
      ElMessage.success(`Revoked permission: ${permission.code}`);
    };

    const grantSelectedPermissions = () => {
      selectedPermissionIds.value.forEach((code) => {
        const permission = currentPermissions.value.find((p) => p.code === code);
        if (permission) {
          permission.granted = true;
        }
      });
      ElMessage.success('Granted selected permissions');
      selectedPermissionIds.value = []; // Reset after granting
    };

    return {
      filterText,
      treeData,
      defaultProps,
      filterNode,
      handleNodeClick,
      currentPermissions,
      grantPermission,
      revokePermission,
      grantSelectedPermissions,
      selectedPermissionIds
    };
  }
};
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
