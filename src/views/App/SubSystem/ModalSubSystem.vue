<template>
  <div>
    <el-dialog
      v-model="isShowModal"
      :close-on-click-modal="false"
      :fullscreen="fullscreen"
      :before-close="closeModal"
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
          class="w-full grid grid-col lg:grid-cols-2 gap-5"
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
              <el-input :placeholder="$t('input.common.enter', { name: $t('column.common.name') })" size="large" v-model="formData.name" clearable />
            </el-form-item>
          </div>
          <div class="flex-1">
            <el-form-item
              :label="$t('column.common.code')"
              class="title--bold"
              prop="name"
              :error="getError('code')"
              :inline-message="hasError('code')"
            >
              <el-input :disabled="isEdit" :placeholder="$t('input.common.enter', { name: $t('column.common.code') })" size="large" v-model="formData.code" clearable />
            </el-form-item>
          </div>
          <div class="flex-1">
            <el-form-item
              :label="$t('sidebar.system')"
              class="title--bold"
              prop="system_id"
              :error="getError('system_id')"
              :inline-message="hasError('system_id')"
            >
              <el-select
                v-model="formData.system_id"
                :placeholder="$t('input.common.select', { name: $t('sidebar.system') })"
                size="large"
                clearable
              >
                <el-option
                  v-for="system in systems"
                  :key="system.id"
                  :label="system.name"
                  :value="system.id"
                />
              </el-select>
            </el-form-item>
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
import baseRuleValidate from '@/Store/Const/baseRuleValidate.js'
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
      systems: [],
      formData: {
        id: null,
        name: null,
        code: null,
        system_id: null
      },
      rules: {
        name: baseRuleValidate(this.$t)(this.$t('column.common.name')),
        code: baseRuleValidate(this.$t)(this.$t('column.common.code')),
        system_id: baseRuleValidate(this.$t)(this.$t('sidebar.system')) 
      },
      fullscreen: false,
      loadingForm: false
    }
  },
  async created() {
    
  },
  watch: {
    isShowModal(val) {
      if (val) {
        this.getAllSystem()
      }
    }
  },
  computed: {
    titlePage() {
      return this.isEdit ? this.$t('back-bar.edit-subsytem') : this.$t('back-bar.create-subsytem')
    }
  },
  methods: {
    async open(id) {
      if (id) {
        this.current_id = id
        this.isEdit = true
        await this.fetchData()
      }
      this.isShowModal = true
    },
    closeModal() {
      this.isShowModal = false
      this.current_id = null
      this.formData = {
        id: null,
        name: null,
        code: null,
        system_id: null
      }
      this.$refs.form.resetFields()
      this.isEdit = false
    },
    async submit() {
      this.loadingForm = true

      const { action, method } = this.prepareSubmit()
      const { status, data } = await axios[method](action, this.formData)
      this.$message({
        type: status === 200 ? 'success' : 'error',
        message: data?.message
      })
      if(data?.status_code === 200) {
        this.isEdit ? this.$emit('update-success') : this.$emit('add-success')
        this.closeModal()
      }
      this.loadingForm = false
    },
    async fetchData() {
      if (this.isEdit) {
        this.loadingForm = true
        const { data } = await axios.get(`/subsystem/${this.current_id}`)
        this.formData = {
          id: data?.data?.id,
          name: data?.data?.name,
          code: data?.data?.code,
          system_id: data?.data?.system?.id
        }
        this.loadingForm = false
      }
    },
    async getAllSystem() {
      try {
        const response = await axios.get('/system')
        this.systems = response?.data?.data
      } catch (error) {
        this.$message.error(error?.response?.data?.message)
      }
    },
    prepareSubmit() {
      return {
        action: this.isEdit ? `/subsystem/${this.current_id}` : '/subsystem',
        method: this.isEdit ? 'put' : 'post'
      }
    },
    handleToggleFullScreen() {
      this.fullscreen = !this.fullscreen
    }
  }
}
</script>
