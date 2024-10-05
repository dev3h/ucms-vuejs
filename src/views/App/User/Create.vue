<template>
  <AdminLayout>
    <div class="w-full bg-white">
      <div class="w-full pt-3 pb-2 px-4">
        <BreadCrumbComponent :bread-crumb="setbreadCrumbHeader" />
      </div>
      <BackBar route-back="user" :title="titlePage">
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
        <el-form class="w-full" ref="form" :model="formData" :rules="rules" label-position="top">
          <div class="grid grid-col lg:grid-cols-3 gap-5">
            <div>
              <el-form-item
                :label="$t('column.common.name')"
                class="title--bold"
                prop="name"
                :error="getError('name')"
                :inline-message="hasError('name')"
              >
                <el-input
                  size="large"
                  v-model="formData.name"
                  clearable
                  :placeholder="$t('input.common.enter', { name: $t('column.common.name') })"
                />
              </el-form-item>
            </div>
            <div>
              <el-form-item
                :label="$t('input.common.email')"
                class="title--bold"
                prop="email"
                :error="getError('email')"
                :inline-message="hasError('email')"
              >
                <el-input
                  size="large"
                  v-model="formData.email"
                  clearable
                  :placeholder="$t('input.common.enter', { name: $t('input.common.email') })"
                />
              </el-form-item>
            </div>
            <div>
              <el-form-item
                :label="$t('input.common.password')"
                prop="password"
                :inline-message="hasError('password')"
                :error="getError('password')"
              >
                <el-input
                  v-model="formData.password"
                  size="large"
                  type="password"
                  show-password
                  clearable
                  :placeholder="$t('input.common.enter', { name: $t('input.common.password') })"
                />
              </el-form-item>
            </div>
            <div>
              <el-form-item
                :label="$t('sidebar.role')"
                class="title--bold"
                prop="role_id"
                :error="getError('role_id')"
                :inline-message="hasError('role_id')"
              >
                <el-select
                  v-model="formData.role_id"
                  :placeholder="$t('input.common.select', { name: $t('sidebar.role') })"
                  size="large"
                  clearable
                >
                  <el-option
                    v-for="role in roles"
                    :key="role?.id"
                    :label="role?.name"
                    :value="role?.id"
                  />
                </el-select>
              </el-form-item>
            </div>
            <div>
              <el-form-item
                :label="$t('input.type-user')"
                class="title--bold"
                prop="type"
                :error="getError('type')"
                :inline-message="hasError('type')"
              >
                <el-select
                  v-model="formData.type"
                  :placeholder="$t('input.common.select', { name: $t('input.type-user') })"
                  size="large"
                  clearable
                >
                  <el-option :label="$t('input.admin')" :value="1" />
                  <el-option :label="$t('input.user')" :value="2" />
                </el-select>
              </el-form-item>
            </div>
          </div>
          <div>
            <el-checkbox
              v-model="formData.two_factor_enable"
              :label="$t('input.enable-2fa')"
              size="large"
            />
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
  props: {
    templatePermission: {
      type: Array,
      default: () => []
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formData: {
        name: null,
        role_id: null,
        type: null,
        two_factor_enable: false,
        password: null
      },
      actions: [],
      roles: [],
      rules: {
        name: baseRuleValidate(this.$t),
        email: baseRuleValidate(this.$t),
        role_id: baseRuleValidate(this.$t),
        type: baseRuleValidate(this.$t),
        password: baseRuleValidate(this.$t)
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
          route: 'user'
        },
        {
          name: 'breadcrumb.create-user',
          route: ''
        }
      ]
    },
    titlePage() {
      return this.isEdit ? this.$t('back-bar.edit-user') : this.$t('back-bar.create-user')
    }
  },
  created() {
    this.fetchRoles()
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'user' })
    },
    async submit() {
      this.loadingForm = true
      await axios.post('/user', this.formData).then((response) => {
        this.$message({
          type: response?.data?.status_code === 200 ? 'success' : 'error',
          message: response.data.message
        })
        if (response?.data?.status_code === 200) {
          this.$router.push({ name: 'user' })
        }
        this.loadingForm = false
      })
    },
    async fetchRoles() {
      await axios
        .get('role', { params: { noPagination: true } })
        .then((response) => {
          this.roles = response?.data?.data
        })
        .catch((error) => {
          this.$message.error(error?.response?.data?.message || this.$t('message.something-wrong'))
        })
    }
  }
}
</script>
<style></style>
