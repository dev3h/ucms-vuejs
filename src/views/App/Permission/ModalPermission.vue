<template>
  <div>
    <el-dialog
      v-model="isShowModal"
      :close-on-click-modal="false"
      :before-close="closeModal"
      :fullscreen="fullscreen"
    >
      <template #header>
        <DialogHeader
          :title="formType === 'add' ? $t('form.add') : $t('form.edit')"
          :isFullscreen="fullscreen"
          @toggleFullscreen="handleToggleFullScreen"
        />
      </template>
      <div class="w-full">
        <el-form
          class="w-full flex flex-col gap-2"
          ref="form"
          :model="formData"
          :rules="rules"
          label-position="top"
        >
          <div class="flex-1">
            <el-form-item
              :label="$t('column.common.name')"
              class="title--bold"
              prop="name"
              :error="getError('name')"
              :inline-message="hasError('name')"
            >
              <el-input size="large" v-model="formData.name" clearable />
            </el-form-item>
          </div>
          <!-- <div class="flex-1 w-full">
            <el-form-item
              :label="$t('column.common.code')"
              class="title--bold code"
              prop="code"
              :error="getError('code')"
              :inline-message="hasError('code')"
            >
              <div class="flex-1">
                <h3 class="font-bold">System</h3>
                <div>
                  <div v-for="system in codeTemplate" :key="system.id">
                    <div class="flex items-center gap-1">
                      <input
                        type="radio"
                        :value="system.code"
                        v-model="systemCode"
                        @change="handleChangeSystem(system.code)"
                      />
                      <label>{{ system.name }}</label>
                    </div>
                    <div v-if="systemCode && systemCode === system.code" class="ml-5">
                      <h3 class="font-bold">Sub System</h3>
                      <div v-for="subsystem in system.subsystems" :key="subsystem.id">
                        <div class="flex items-center gap-1">
                          <input
                            type="radio"
                            :value="subsystem.code"
                            v-model="subsytemCode"
                            @change="handleChangeSubSystem(subsystem.code)"
                          />
                          <label>{{ subsystem.name }}</label>
                        </div>
                        <div v-if="subsytemCode && subsytemCode === subsystem.code" class="ml-5">
                          <h3 class="font-bold">Module</h3>
                          <div v-for="module in subsystem.modules" :key="module.id">
                            <div class="flex items-center gap-1">
                              <input
                                type="radio"
                                :value="module.code"
                                v-model="moduleCode"
                                @change="handleChangeModule(module.code)"
                              />
                              <label>{{ module.name }}</label>
                            </div>
                            <div v-if="moduleCode && moduleCode === module.code" class="ml-5">
                              <h3 class="font-bold">Action</h3>
                              <div v-for="action in module.actions" :key="action.id">
                                <div class="flex items-center gap-1">
                                  <input
                                    type="radio"
                                    :value="action.code"
                                    v-model="actionCode"
                                    @change="handleChangeAction(action.code)"
                                  />
                                  <label>{{ action.name }}</label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-form-item>
          </div> -->
          <div>
            <h3 class="font-bold">Permission</h3>
            <el-input
              v-model="searchQuery"
              placeholder="Search systems or subsystems..."
              @input="filterTree"
              clearable
            />
            <el-tree
              :data="filteredPermissions"
              node-key="code"
              :props="treeProps"
              highlight-current
              default-expand-all
              ref="permissionTree"
            >
              <template #default="{ node, data }">
                <div v-if="data.type !== 'action'">
                  {{ data.label }}
                </div>
                <div v-else>
                  <el-radio-group v-model="selectedAction" @change="updateSelectedAction(data)">
                    <el-radio :label="data.code" :key="data.code">
                      {{ data.label }}
                    </el-radio>
                  </el-radio-group>
                </div>
              </template>
            </el-tree>
            <div style="margin-top: 20px">
              <strong>Selected Action Code:</strong> {{ selectedAction }}
            </div>
          </div>
        </el-form>
      </div>
      <template #footer>
        <div class="w-full flex justify-center items-center">
          <el-button type="danger" size="large" @click="closeModal">{{
            $t('button.cancel')
          }}</el-button>
          <el-button type="primary" size="large" @click="doSubmit()" :loading="loadingForm">{{
            $t('button.save')
          }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import axios from '@/Plugins/axios'
import form from '@/Mixins/form.js'
import DialogHeader from '@/components/Dialog/DialogHeader.vue'
export default {
  components: { DialogHeader },
  mixins: [form],
  props: {
    redirectRoute: {
      type: String,
      default: null
    }
  },
  emits: ['add-success', 'update-success'],
  data() {
    return {
      formType: 'add',
      isShowModal: false,
      current_id: null,
      formData: {
        id: null,
        name: null,
        code: null
      },
      systemCode: null,
      subsytemCode: null,
      moduleCode: null,
      actionCode: null,
      codeTemplate: [],
      rules: {
        name: [{ required: true, message: 'This field is required', trigger: ['blur', 'change'] }],
        code: [{ required: true, message: 'This field is required', trigger: ['blur', 'change'] }]
      },
      fullscreen: false,
      loadingForm: false,
      searchQuery: '',
      permissions: [
        {
          label: 'System A',
          code: 'systemA',
          type: 'system',
          children: [
            {
              label: 'Subsystem A1',
              code: 'subsystemA1',
              type: 'subsystem',
              children: [
                {
                  label: 'Module A1.1',
                  code: 'moduleA11',
                  type: 'module',
                  children: [
                    {
                      label: 'View',
                      code: 'systemA-subsystemA1-moduleA11-view',
                      type: 'action',
                      moduleCode: 'moduleA11'
                    },
                    {
                      label: 'Edit',
                      code: 'systemA-subsystemA1-moduleA11-edit',
                      type: 'action',
                      moduleCode: 'moduleA11'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          label: 'System B',
          code: 'systemB',
          type: 'system',
          children: [
            {
              label: 'Subsystem B1',
              code: 'subsystemB1',
              type: 'subsystem',
              children: [
                {
                  label: 'Module B1.1',
                  code: 'moduleB11',
                  type: 'module',
                  children: [
                    {
                      label: 'View',
                      code: 'systemB-subsystemB1-moduleB11-view',
                      type: 'action',
                      moduleCode: 'moduleB11'
                    },
                    {
                      label: 'Edit',
                      code: 'systemB-subsystemB1-moduleB11-edit',
                      type: 'action',
                      moduleCode: 'moduleB11'
                    }
                  ]
                },
                {
                  label: 'Module B1.2',
                  code: 'moduleB12',
                  type: 'module',
                  children: [
                    {
                      label: 'View',
                      code: 'systemB-subsystemB1-moduleB12-view',
                      type: 'action',
                      moduleCode: 'moduleB12'
                    },
                    {
                      label: 'Edit',
                      code: 'systemB-subsystemB1-moduleB12-edit',
                      type: 'action',
                      moduleCode: 'moduleB12'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          label: 'System C',
          code: 'systemC',
          type: 'system',
          children: [
            {
              label: 'Subsystem C1',
              code: 'subsystemC1',
              type: 'subsystem',
              children: [
                {
                  label: 'Module C1.1',
                  code: 'moduleC11',
                  type: 'module',
                  children: [
                    {
                      label: 'View',
                      code: 'systemC-subsystemC1-moduleC11-view',
                      type: 'action',
                      moduleCode: 'moduleC11'
                    },
                    {
                      label: 'Edit',
                      code: 'systemC-subsystemC1-moduleC11-edit',
                      type: 'action',
                      moduleCode: 'moduleC11'
                    }
                  ]
                },
                {
                  label: 'Module C1.2',
                  code: 'moduleC12',
                  type: 'module',
                  children: [
                    {
                      label: 'View',
                      code: 'systemC-subsystemC1-moduleC12-view',
                      type: 'action',
                      moduleCode: 'moduleC12'
                    },
                    {
                      label: 'Edit',
                      code: 'systemC-subsystemC1-moduleC12-edit',
                      type: 'action',
                      moduleCode: 'moduleC12'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      selectedAction: {},
      treeProps: {
        label: 'label',
        children: 'children',
        isLeaf: (data) => data.type === 'action'
      }
    }
  },
  created() {
    this.getCodeTemplateForPermission()
  },
  computed: {
    filteredPermissions() {
      if (!this.searchQuery) return this.permissions

      return this.permissions
        .map((system) => {
          if (system.label.toLowerCase().includes(this.searchQuery.toLowerCase())) {
            // If the system matches, keep the full system structure
            return system
          }

          const matchingSubsystems = system.children
            .map((subsystem) => {
              if (subsystem.label.toLowerCase().includes(this.searchQuery.toLowerCase())) {
                // If the subsystem matches, keep the full subsystem structure
                return subsystem
              }
              return null
            })
            .filter(Boolean)

          if (matchingSubsystems.length > 0) {
            // Return system with only matching subsystems
            return {
              ...system,
              children: matchingSubsystems
            }
          }
          return null
        })
        .filter(Boolean) // Filter out any null results
    }
  },
  methods: {
    filterTree() {
      const tree = this.$refs.permissionTree
      if (tree) {
        tree.store.setData(this.filteredPermissions) // Update the tree data dynamically
      }
    },
    updateSelectedAction(action) {
      this.selectedAction = action.code
    },
    async open(id) {
      if (id) {
        this.current_id = id
        this.formType = 'edit'
        await this.fetchData()
      }
      this.isShowModal = true
    },
    closeModal() {
      this.formData = {
        id: null,
        name: null
      }
      this.systemCode = null
      this.subsytemCode = null
      this.moduleCode = null
      this.actionCode = null
      this.isShowModal = false
      this.current_id = null
      this.$refs.form.resetFields()
      this.formType = 'add'
    },
    async submit() {
      this.loadingForm = true
      this.formData.code = `${this.systemCode}-${this.subsytemCode}-${this.moduleCode}-${this.actionCode}`
      const { action, method } = this.prepareSubmit()
      const { status, data } = await axios[method](action, this.formData)
      this.$message({
        type: status === 200 ? 'success' : 'error',
        message: data?.message
      })
      this.loadingForm = false
      this.isShowModal = false
      // this.$inertia.visit(this.redirectRoute)
    },
    async fetchData() {
      if (this.formType === 'edit') {
        this.loadingForm = true
        const { data } = await axios.get(`/permission/${this.current_id}`)
        this.formData = data?.data
        const code = this.formData.code.split('-')
        this.systemCode = code[0]
        this.subsytemCode = code[1]
        this.moduleCode = code[2]
        this.actionCode = code[3]
        this.loadingForm = false
      }
    },
    async getCodeTemplateForPermission() {
      this.loadingForm = true
      // const { data } = await axios.get('/permission/code-template')
      // this.codeTemplate = data?.data
      this.loadingForm = false
    },
    handleCodePermission(systemCode, subsytemCode, moduleCode, actionCode) {
      this.formData.code = `${systemCode}-${subsytemCode}-${moduleCode}-${actionCode}`
    },
    handleChangeSystem(code) {
      this.subsytemCode = null
      this.moduleCode = null
      this.actionCode = null
      this.systemCode = code
      this.handleCodePermission(
        this.systemCode,
        this.subsytemCode,
        this.moduleCode,
        this.actionCode
      )
    },
    handleChangeSubSystem(code) {
      this.moduleCode = null
      this.actionCode = null
      this.subsytemCode = code
      this.handleCodePermission(
        this.systemCode,
        this.subsytemCode,
        this.moduleCode,
        this.actionCode
      )
    },
    handleChangeModule(code) {
      this.actionCode = null
      this.moduleCode = code
      this.handleCodePermission(
        this.systemCode,
        this.subsytemCode,
        this.moduleCode,
        this.actionCode
      )
    },
    handleChangeAction(code) {
      this.actionCode = code
      this.handleCodePermission(
        this.systemCode,
        this.subsytemCode,
        this.moduleCode,
        this.actionCode
      )
    },
    prepareSubmit() {
      let action = null
      let method = 'post'
      if (this.formType === 'add') {
        action = '/permission'
      } else {
        action = `/permission/${this.current_id}`
        method = 'put'
      }
      return { action, method }
    },
    handleToggleFullScreen() {
      this.fullscreen = !this.fullscreen
    }
  }
}
</script>
<style scoped>
:deep(.code .el-form-item__content) {
  flex-direction: column-reverse;
  align-items: start;
  padding-left: 20px;
}
</style>
