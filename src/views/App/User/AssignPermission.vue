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
            ref="tree"
            default-expand-all
            highlight-current
          />
        </el-aside>
        <el-table
          v-if="currentPermissions.length > 0"
          :data="currentPermissions"
          class="flex-1"
          style="width: 100%"
        >
          <el-table-column
            type="selection"
            v-model="selectedPermissionIds"
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
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import AdminLayout from '@/Layouts/AdminLayout.vue'
import BreadCrumbComponent from '@/components/Page/BreadCrumb.vue'
import { searchMenu } from '@/Mixins/breadcrumb.js'
import axios from '@/Plugins/axios'
import BackBar from '@/components/BackBar/Index.vue'

export default {
  components: { AdminLayout, BreadCrumbComponent, BackBar },
  data() {
    return {
      item: null,
      id: this.$route.params.id,
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
      ],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      currentPermissions: [],
      selectedPermissionIds: []
    }
  },
  computed: {
    setbreadCrumbHeader() {
      let menuOrigin = searchMenu()
      return [
        {
          name: menuOrigin?.label,
          route: 'user-show'
        },
        {
          name: this.item?.name,
          route: '',
          isNoTranslate: true
        }
      ]
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'system' })
    },
     async fetchData() {
      try {
        const response = await axios.get(`/user/${this.id}/rest-available-permissions`)
        const data = response?.data?.data

        // Transform the data into the desired treeData format
        this.treeData = this.transformData(data);

        this.item = data
      } catch (error) {
        this.$message({
          type: 'error',
          message: error.response.data.message || this.$t('something-wrong')
        })
      }
    },
    transformData(data) {
      return data.map(system => ({
        label: system.name,
        children: system.subsystems.map(subsystem => ({
          label: subsystem.name,
          children: subsystem.modules.map(module => ({
            label: module.name,
            permission: module.actions.map(action => ({
              action_name: action.name,
              granted: action.granted,
              code: action.code
            }))
          }))
        }))
      }));
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.toLowerCase().includes(value.toLowerCase());
    },
    handleNodeClick(nodeData) {
      // Xóa danh sách quyền đã chọn khi nhấp vào một node khác
      this.selectedPermissionIds = [];

      // Hiển thị tất cả quyền trong node system
      if (nodeData.children && nodeData.children.length) {
        this.currentPermissions = [];
        nodeData.children.forEach((subsystem) => {
          if (subsystem.children) {
            subsystem.children.forEach((module) => {
              if (module.permission) {
                this.currentPermissions.push(...module.permission);
              }
            });
          } else if (subsystem.permission) {
            this.currentPermissions.push(...subsystem.permission);
          }
        });
      }
      // Khi nhấp vào subsystem, hiển thị tất cả quyền của tất cả các mô-đun trong subsystem đó
      else if (nodeData.children) {
        this.currentPermissions = [];
        nodeData.children.forEach((module) => {
          if (module.permission) {
            this.currentPermissions.push(...module.permission);
          }
        });
      }
      // Khi nhấp vào một mô-đun, hiển thị tất cả quyền trong module đó
      else if (nodeData.permission) {
        this.currentPermissions = nodeData.permission;
      } else {
        this.currentPermissions = [];
      }
    },
    grantPermission(permission) {
      permission.granted = true;
      this.$message.success(`Granted permission: ${permission.code}`);
    },
    revokePermission(permission) {
      permission.granted = false;
      this.$message.success(`Revoked permission: ${permission.code}`);
    },
    grantSelectedPermissions() {
      this.selectedPermissionIds.forEach((code) => {
        const permission = this.currentPermissions.find((p) => p.code === code);
        if (permission) {
          permission.granted = true;
        }
      });
      this.$message.success('Granted selected permissions');
      this.selectedPermissionIds = []; // Reset after granting
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