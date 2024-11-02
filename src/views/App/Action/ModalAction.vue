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
          class="w-full grid grid-cols-2 gap-2"
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
              <el-input
                :placeholder="$t('input.common.enter', { name: $t('column.common.name') })"
                size="large"
                v-model="formData.name"
                clearable
              />
            </el-form-item>
          </div>
          <div class="flex-1">
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
      formData: {
        id: null,
        name: null,
        code: null
      },
      rules: {
        name: baseRuleValidate(this.$t)(this.$t('column.common.name')),
        code: baseRuleValidate(this.$t)(this.$t('column.common.code'))
      },
      fullscreen: false,
      loadingForm: false
    }
  },
  computed: {
    titlePage() {
      return this.isEdit ? this.$t('back-bar.edit-action') : this.$t('back-bar.create-action')
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
      if (data?.status_code === 200) {
        this.isEdit ? this.$emit('update-success') : this.$emit('add-success')
        this.closeModal()
      }
      this.loadingForm = false
    },
    async fetchData() {
      if (this.isEdit) {
        try {
          this.loadingForm = true
          const { data } = await axios.get(`/action/${this.current_id}`)
          this.formData = {
            id: data?.data?.id,
            name: data?.data?.name,
            code: data?.data?.code
          }
          this.loadingForm = false
        } catch (error) {
          this.loadingForm = false
          this.$message.error(error?.response?.data?.message || this.$t('message.something-wrong'))
        }
      }
    },
    prepareSubmit() {
      return {
        action: this.isEdit ? `/action/${this.current_id}` : '/action',
        method: this.isEdit ? 'put' : 'post'
      }
    },
    handleToggleFullScreen() {
      this.fullscreen = !this.fullscreen
    }
  }
}
</script>
