<template>
  <AdminLayout>
    <div class="w-full h-full bg-white px-4">
      <div class="w-full pt-3 pb-2 border-b-[1px]">
        <BreadCrumbComponent :bread-crumb="setbreadCrumbHeader" />
      </div>
      <div class="w-full my-[15px] flex justify-start items-center">
        <el-button type="primary" size="large" @click="doSubmit()" :loading="loadingForm">{{
          $t('button.save')
        }}</el-button>
        <el-button type="danger" size="large" @click="goBack()">{{
          $t('button.cancel')
        }}</el-button>
      </div>
      <div class="w-full">
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
              <el-input size="large" v-model="formData.name" clearable />
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
              <el-input size="large" v-model="formData.code" clearable />
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
              <el-input size="large" v-model="formData.redirect_uris" clearable />
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

export default {
  components: { AdminLayout, BreadCrumbComponent },
  mixins: [form],
  data() {
    return {
      formData: {
        name: null,
        code: null,
        redirect_uris: null
      },
      actions: [],
      rules: {
        name: baseRuleValidate(this.$t),
        code: baseRuleValidate(this.$t),
        redirect_uris: baseRuleValidate(this.$t)
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
          name: 'breadcrumb.create-system',
          route: ''
        }
      ]
    }
  },

  methods: {
    goBack() {
      this.$router.push({name: 'system'})
    },
    async submit() {
      this.loadingForm = true
      await axios.post('/system', this.formData).then(
        (response) => this.$message({
          type: response.status === 200 ? 'success' : 'error',
          message: response.data.message
        }).then(() => {
          if(response?.status === 200) {
            this.$router.push({name: 'system'})
          }
        })
      )
      
      this.loadingForm = false
    }
  }
}
</script>
<style></style>
