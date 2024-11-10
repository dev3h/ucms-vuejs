<template>
  <div>
    <el-dialog
      v-model="isShowModal"
      :close-on-click-modal="false"
      :before-close="closeModal"
      :fullscreen="fullscreen"
      class="dialog-base"
    >
      <template #header>
        <DialogHeader
          :title="titlePage"
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
              :label="$t('column.description')"
              class="title--bold"
              prop="description"
              :error="getError('description')"
              :inline-message="hasError('description')"
            >
              <el-input
                :placeholder="$t('input.common.enter', { name: $t('column.description') })"
                size="large"
                v-model="formData.description"
                clearable
              />
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
            <h3 class="font-bold text-[#282828]">
              {{ $t('column.common.code') }} <span class="text-red-500">*</span>
            </h3>
            <el-input
              v-model="searchQuery"
              :placeholder="$t('input.common.search')"
              @input="filterTree"
              clearable
            />
            <el-form-item
              class="title--bold"
              prop="code"
              :error="getError('code')"
              :inline-message="hasError('code')"
            >
              <el-tree
                class="w-full"
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
                      <el-radio :value="data.code" :key="data.code">
                        {{ data.label }}
                      </el-radio>
                    </el-radio-group>
                  </div>
                </template>
              </el-tree>
            </el-form-item>

            <div style="margin-top: 20px">
              <strong> -> {{ $t('column.common.code') }}:</strong> {{ selectedAction }}
            </div>
          </div>
        </el-form>
      </div>
      <template #footer>
        <div class="flex justify-center">
          <el-button class="w-[120px]" type="info" size="large" @click="closeModal">{{
            $t('button.cancel')
          }}</el-button>
          <el-button
            class="w-[120px]"
            type="primary"
            size="large"
            @click="doSubmit()"
            :loading="loadingForm"
            >{{ $t('button.save') }}</el-button
          >
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
      isEdit: false,
      isShowModal: false,
      current_id: null,
      formData: {
        id: null,
        description: null
      },
      rules: {},
      fullscreen: false,
      loadingForm: false,
      searchQuery: '',
      permissions: [],
      selectedAction: null,
      treeProps: {
        label: 'label',
        children: 'children',
        isLeaf: (data) => data.type === 'action'
      }
    }
  },
  created() {
    this.getTemplateTreeCode()
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
    },
    titlePage() {
      return this.isEdit
        ? this.$t('back-bar.edit-permission')
        : this.$t('back-bar.create-permission')
    }
  },
  methods: {
    async getTemplateTreeCode() {
      try {
        this.loadingForm = true
        const response = await axios.get('/role/permission-template')
        this.transformDataList(response?.data?.data)
        this.loadingForm = false
      } catch (err) {
        this.loadingForm = false
        this.$message.error(err?.response?.data?.message || this.$t('message.something-wrong'))
      }
    },
    transformDataList(data) {
      const transformDataList = data?.map((system) => {
        return {
          id: `SYSTEM_${system?.id}`,
          label: system?.name,
          type: 'system',
          code: system?.code,
          children: system?.subsystems?.map((subsystem) => {
            return {
              id: `SUBSYSTEM_${subsystem?.id}`,
              label: subsystem?.name,
              type: 'subsystem',
              code: subsystem?.code,
              children: subsystem?.modules?.map((module) => {
                return {
                  id: `MODULE_${module?.id}`,
                  label: module?.name,
                  type: 'module',
                  code: module?.code,
                  children: module?.actions?.map((action) => {
                    return {
                      id: `ACTION_${action?.id}`,
                      label: action?.name,
                      // code: action?.code,
                      code: action?.permission_code,
                      granted: action?.granted,
                      type: 'action',
                      moduleCode: module?.code
                    }
                  })
                }
              })
            }
          })
        }
      })
      this.permissions = transformDataList
    },
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
        this.isEdit = true
        await this.fetchData()
      }
      this.isShowModal = true
    },
    closeModal() {
      this.formData = {
        id: null,
        name: null
      }
      this.selectedAction = null
      this.isShowModal = false
      this.current_id = null
      this.$refs.form.resetFields()
      this.isEdit = false
    },
    async submit() {
      this.loadingForm = this.formData.code = this.selectedAction
      const { action, method } = this.prepareSubmit()
      const response = await axios[method](action, this.formData)
      this.$message({
        type: response?.data?.status_code === 200 ? 'success' : 'error',
        message: response?.data?.message
      })
      if(response?.data?.status_code === 200) {
        this.isEdit ? this.$emit('update-success') : this.$emit('add-success')
        this.closeModal()
      }
      this.loadingForm = false
    },
    async fetchData() {
      if (this.isEdit) {
        try {
          this.loadingForm = true
          const response = await axios.get(`/permission/${this.current_id}`)
          if (response?.data?.status_code === 200) {
            this.formData = response?.data?.data
            this.selectedAction = response?.data?.data?.code
          }
          this.loadingForm = false
        } catch (error) {
          this.loadingForm = false
          this.$message.error(error?.response?.data?.message || this.$t('message.something-wrong'))
        }
      }
    },
    // async getCodeTemplateForPermission() {
    //   this.loadingForm = true
    //   const { data } = await axios.get('/permission/code-template')
    //   this.codeTemplate = data?.data
    //   this.loadingForm = false
    // },
    // handleCodePermission(systemCode, subsytemCode, moduleCode, actionCode) {
    //   this.formData.code = `${systemCode}-${subsytemCode}-${moduleCode}-${actionCode}`
    // },
    // handleChangeSystem(code) {
    //   this.subsytemCode = null
    //   this.moduleCode = null
    //   this.actionCode = null
    //   this.systemCode = code
    //   this.handleCodePermission(
    //     this.systemCode,
    //     this.subsytemCode,
    //     this.moduleCode,
    //     this.actionCode
    //   )
    // },
    // handleChangeSubSystem(code) {
    //   this.moduleCode = null
    //   this.actionCode = null
    //   this.subsytemCode = code
    //   this.handleCodePermission(
    //     this.systemCode,
    //     this.subsytemCode,
    //     this.moduleCode,
    //     this.actionCode
    //   )
    // },
    // handleChangeModule(code) {
    //   this.actionCode = null
    //   this.moduleCode = code
    //   this.handleCodePermission(
    //     this.systemCode,
    //     this.subsytemCode,
    //     this.moduleCode,
    //     this.actionCode
    //   )
    // },
    // handleChangeAction(code) {
    //   this.actionCode = code
    //   this.handleCodePermission(
    //     this.systemCode,
    //     this.subsytemCode,
    //     this.moduleCode,
    //     this.actionCode
    //   )
    // },
    prepareSubmit() {
      return {
        action: this.isEdit ? `/permission/${this.current_id}` : '/permission',
        method: this.isEdit ? 'put' : 'post'
      }
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
