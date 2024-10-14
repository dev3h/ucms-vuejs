<!-- PermissionManager.vue -->
<template>
  <el-row>
    <el-col :span="6">
      <el-tree
        :data="treeData"
        :props="treeProps"
        default-expand-all
        :expand-on-click-node="false"
        :default-expanded-keys="expandedKeys"
        @node-click="handleNodeClick"
        :current-node-key="activeSubsystemCode"
        highlight-current
        :render-content="renderTreeNode"
      >
      </el-tree>
    </el-col>
    <el-col :span="18" style="padding-left: 20px">
      <div v-if="activeSubsystem">
        <h2>{{ activeSubsystem.subsystem_name }}</h2>
        <div
          v-for="module in activeSubsystem.modules"
          :key="module.module_code"
          style="margin-bottom: 20px"
        >
          <el-checkbox
            v-model="checkedModules[module.module_code]"
            @change="handleModuleCheckChange(module)"
          >
            {{ module.module_name }}
          </el-checkbox>
          <div style="padding-left: 20px">
            <el-checkbox v-for="action in module.actions" :key="action.action_code" @change="handleToggleAction(action)">
              {{ action.action_name }}
            </el-checkbox>
          </div>
        </div>
      </div>
      <el-button type="primary" @click="updatePermissions">Cập Nhật Quyền</el-button>
    </el-col>
  </el-row>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { systems } from './data' // Import dữ liệu từ data.js

export default {
  name: 'PermissionManager',
  setup() {
    // Chuyển đổi dữ liệu hệ thống thành cấu trúc phù hợp với el-tree
    const treeData = ref(
      systems.map((system) => ({
        label: system.system_name,
        id: system.system_code,
        children: system.subsystems.map((sub) => ({
          label: sub.subsystem_name,
          id: sub.subsystem_code,
          data: sub
        }))
      }))
    )

    const treeProps = {
      children: 'children',
      label: 'label'
    }
    const actionChecked= ref([])

    // Lựa chọn subsystem hiện tại
    const activeSubsystemCode = ref(systems[0].subsystems[0].subsystem_code)
    const activeSubsystem = computed(() => {
      const system = systems.find((sys) => sys.system_code === 'SYS1') // Giả sử chỉ có 1 hệ thống
      return system.subsystems.find((sub) => sub.subsystem_code === activeSubsystemCode.value)
    })

    // Trạng thái checkbox
    const checkedModules = reactive({})
    const checkedActions = reactive({})

    // Khởi tạo trạng thái checkbox
    onMounted(() => {
      systems.forEach((system) => {
        system.subsystems.forEach((sub) => {
          checkedModules[sub.subsystem_code] = {}
          checkedActions[sub.subsystem_code] = {}
          sub.modules.forEach((mod) => {
            checkedModules[sub.subsystem_code][mod.module_code] = false
            checkedActions[sub.subsystem_code][mod.module_code] = {}
            mod.actions.forEach((act) => {
              checkedActions[sub.subsystem_code][mod.module_code][act.action_code] = false
            })
          })
        })
      })
    })

    // Xử lý khi chọn một node trong tree
    const handleNodeClick = (node) => {
      if (node.data) {
        // Chỉ xử lý khi node là subsystem
        activeSubsystemCode.value = node.data.subsystem_code
      }
    }

    
    // Xử lý khi checkbox module thay đổi
    const handleModuleCheckChange = (module) => {
      const subsystemCode = activeSubsystemCode.value
      const moduleCode = module.module_code
      const isChecked = checkedModules[subsystemCode][moduleCode]
      module.actions.forEach((action) => {
        checkedActions[subsystemCode][moduleCode][action.action_code] = isChecked
      })
    }

    const handleToggleAction = (action) => {
      console.log(action)
    }


    // Cập nhật quyền
    const updatePermissions = () => {
      const permissions = []
      systems.forEach((system) => {
        system.subsystems.forEach((sub) => {
          sub.modules.forEach((mod) => {
            mod.actions.forEach((act) => {
              const isChecked = checkedActions[sub.subsystem_code][mod.module_code][act.action_code]
              if (isChecked) {
                const permissionCode = `${system.system_code}-${sub.subsystem_code}-${mod.module_code}-${act.action_code}`
                permissions.push(permissionCode)
              }
            })
          })
        })
      })

      // Gọi API hoặc xử lý cập nhật quyền tại đây
      console.log('Cập nhật quyền:', permissions)
      // Ví dụ: axios.post('/api/update-permissions', { permissions })
    }

    // Tạo danh sách các khóa mở rộng mặc định
    const expandedKeys = ref([])
    onMounted(() => {
      systems.forEach((system) => {
        expandedKeys.value.push(system.system_code)
        system.subsystems.forEach((sub) => {
          expandedKeys.value.push(sub.subsystem_code)
        })
      })
    })

    // Render tree node content
    const renderTreeNode = (h, { node, data, store }) => {
      return h(
        'span',
        {
          style: {
            cursor: data.children ? 'default' : 'pointer',
            color: data.children ? 'gray' : 'black'
          }
        },
        data.label
      )
    }

    return {
      treeData,
      treeProps,
      activeSubsystem,
      activeSubsystemCode,
      checkedModules,
      checkedActions,
      handleNodeClick,
      handleModuleCheckChange,
      updatePermissions,
      expandedKeys,
      renderTreeNode
    }
  }
}
</script>

<style scoped>
/* Thêm CSS nếu cần */
</style>
