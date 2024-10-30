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
          :title="titlePage"
          :isFullscreen="fullscreen"
          @toggleFullscreen="handleToggleFullScreen"
        />
      </template>
      <div class="w-full">
        <el-form
          class="w-full lg:flex flex-wrap gap-2"
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
          <div class="flex-1">
            <el-form-item
              :label="$t('column.common.code')"
              class="title--bold"
              prop="name"
              :error="getError('code')"
              :inline-message="hasError('code')"
            >
              <el-input size="large" v-model="formData.code" clearable />
            </el-form-item>
          </div>
        </el-form>
      </div>
      <div class="w-full my-[15px] flex justify-center items-center">
        <el-button type="danger" size="large" @click="closeModal">{{
          $t('button.cancel')
        }}</el-button>
        <el-button type="primary" size="large" @click="doSubmit()" :loading="loadingForm">{{
          $t('button.save')
        }}</el-button>
      </div>
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
      formData: {
        id: null,
        name: null,
        code: null
      },
      rules: {
        name: baseRuleValidate(this.$t)(this.$t('column.common.name')),
        code: baseRuleValidate(this.$t)(this.$t('column.common.code')),
      },
      fullscreen: false,
      loadingForm: false
    }
  },
  computed: {
    titlePage() {
      return this.isEdit ? this.$t('back-bar.edit-module') : this.$t('back-bar.create-module')
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
        code: null
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
        const { data } = await axios.get(this.appRoute('admin.api.module.show', this.current_id))
        this.formData = {
          id: data?.data?.id,
          name: data?.data?.name,
          code: data?.data?.code
        }
        this.loadingForm = false
      }
    },
    prepareSubmit() {
      return {
        action: this.isEdit ? `/module/${this.current_id}` : '/module',
        method: this.isEdit ? 'put' : 'post'
      }
    },
    handleToggleFullScreen() {
      this.fullscreen = !this.fullscreen
    }
  }
}
</script>
