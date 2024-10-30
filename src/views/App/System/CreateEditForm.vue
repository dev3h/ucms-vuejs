<template>
  <AdminLayout>
    <div class="w-full bg-white">
      <div class="w-full pt-3 pb-2 px-4">
        <BreadCrumbComponent :bread-crumb="setbreadCrumbHeader" />
      </div>
      <BackBar route-back="system" :title="titlePage">
        <template #actionBackBar>
          <div>
            <el-button class="w-[120px]" type="info" size="large" @click="goBack()">{{
              $t('button.cancel')
            }}</el-button>
            <el-button
              class="w-[120px]"
              type="primary"
              size="large"
              @click="doSubmit()"
              :loading="loadingForm"
            >
              {{ isEdit ? $t('button.update') : $t('button.add') }}
            </el-button>
          </div>
        </template>
      </BackBar>
      <div class="w-full px-4 mt-8 pb-8">
        <el-form
          class="w-full grid grid-col lg:grid-cols-2 gap-5"
          ref="form"
          :model="formData"
          :rules="rules"
          label-position="top"
        >
          <div class="col-span-1">
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

          <div class="col-span-1">
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

          <div class="col-span-1">
            <el-form-item
              :label="$t('input.redirect-uri')"
              class="title--bold"
              prop="redirect_uris"
              :error="getError('redirect_uris')"
              :inline-message="hasError('redirect_uris')"
            >
              <template #label>
                <div>{{ $t('input.redirect-uri') }}<span class="text-red-400 ml-1">*</span></div>
              </template>
              <div class="flex flex-col w-full">
                <div
                  v-for="(uri, index) in formData.redirect_uris"
                  :key="index"
                  class="flex items-start gap-1 w-full"
                >
                  <!--  :rules="[
                      {
                      required: true,
                      message: $t('validate.required', { column: $t('input.redirect-uri') }),
                      trigger: ['blur', 'change']
                      },
                      { type: 'url', message: $t('validate.url'), trigger: ['blur', 'change'] }
                    ]" -->
                  <el-form-item
                    style="margin-bottom: 8px !important"
                    class="w-full"
                    :prop="'redirect_uris.' + index"
                  >
                    <el-input
                      size="large"
                      v-model="formData.redirect_uris[index]"
                      clearable
                      :placeholder="$t('input.common.enter', { name: $t('input.redirect-uri') })"
                    />
                  </el-form-item>
                  <span
                    v-if="index > 0"
                    @click="removeRedirectUri(index)"
                    class="w-3 cursor-pointer text-2xl text-red-400"
                    >x</span
                  >
                </div>
                <span
                  @click="addRedirectUri"
                  class="w-fit cursor-pointer text-2xl text-primary font-bold"
                >
                  +
                </span>
              </div>
            </el-form-item>
          </div>
        </el-form>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import AdminLayout from '@/Layouts/AdminLayout.vue'
import BreadCrumbComponent from '@/components/Page/BreadCrumb.vue'
import { searchMenu } from '@/Mixins/breadcrumb.js'
import axios from '@/Plugins/axios'
import form from '@/Mixins/form.js'
import baseRuleValidate from '@/Store/Const/baseRuleValidate.js'
import BackBar from '@/components/BackBar/Index.vue'

export default {
  components: { AdminLayout, BreadCrumbComponent, BackBar },
  mixins: [form],
  data() {
    return {
      isEdit: false,
      formData: {
        id: this.$route.params.id,
        name: null,
        code: null,
        redirect_uris: ['']
      },
      actions: [],
      rules: {
        name: baseRuleValidate(this.$t)(this.$t('column.common.name')),
        code: baseRuleValidate(this.$t)(this.$t('column.common.code'))
      },
      loadingForm: false
    }
  },
  computed: {
    setbreadCrumbHeader() {
      let menuOrigin = searchMenu()
      return [
        {
          name: menuOrigin?.label,
          route: 'system'
        },
        {
          name: this.isEdit ? 'breadcrumb.edit-system' : 'breadcrumb.create-system',
          route: ''
        }
      ]
    },
    titlePage() {
      return this.isEdit ? this.$t('back-bar.edit-system') : this.$t('back-bar.create-system')
    }
  },
  async mounted() {
    if (this.formData.id) {
      this.isEdit = true
      await this.fetchData()
    }
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'system' })
    },
    addRedirectUri() {
      this.formData.redirect_uris.push('')
    },
    removeRedirectUri(index) {
      this.formData.redirect_uris.splice(index, 1)
    },
    async fetchData() {
      try {
        this.loadingForm = true
        await axios.get(`/system/${this.formData.id}`).then((response) => {
          if (response?.data?.status_code === 200) {
            const { id, name, code, redirect_uris } = response?.data?.data
            this.formData = {
              id,
              name,
              code,
              redirect_uris
            }
          }
          this.loadingForm = false
        })
      } catch (error) {
        this.loadingForm = false
        this.$message.error(error?.response?.data?.message || this.$t('message.something-wrong'))
      }
    },
    async submit() {
      this.loadingForm = true
      const { method, url } = this.prepareSubmit()
      await axios?.[method](url, this.formData).then((response) => {
        this.$message({
          type: response?.data?.status_code === 200 ? 'success' : 'error',
          message: response?.data?.message
        })
        if (response?.data?.status_code === 200) {
          this.$router.push({ name: 'system' })
        }
        this.loadingForm = false
      })
    },
    prepareSubmit() {
      return {
        method: this.isEdit ? 'put' : 'post',
        url: this.isEdit ? `/system/${this.formData.id}` : '/system',
      }
    }
  }
}
</script>
<style></style>
