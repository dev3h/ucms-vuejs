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
          <div class="flex flex-col items-center mb-9">
            <div class="upload-container" :class="{'!border-none': preview}" @click="triggerFileInput">
                  <input
                      type="file"
                      ref="fileInput"
                      accept="image/png, image/jpeg"
                      @change="handleFileChange"
                      style="display: none;"
                  />
                  <div class="upload-box">
                      <div v-if="preview" class="image-preview">
                          <img :src="preview" alt="Image Preview" />
                          <button class="remove-btn" @click.stop="removeImage">×</button>
                      </div>
                      <div v-else class="upload-placeholder">
                          <img src="/images/svg/plus.svg" alt=""/>
                      </div>
                  </div>
              </div>
              <div v-if="hasError('avatar')">
                  <span class="text-red-500 text-xs">{{getError('avatar')}}</span>
              </div>
          </div>
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
                :label="$t('input.phone-number')"
                class="title--bold"
                prop="phone_number"
                :error="getError('phone_number')"
                :inline-message="hasError('phone_number')"
              >
                <el-input
                  size="large"
                  v-model="formData.phone_number"
                  clearable
                  :placeholder="$t('input.common.enter', { name: $t('input.phone-number') })"
                  @input="onPhoneNumberInput"
                />
              </el-form-item>
            </div>
            <div v-if="!isEdit">
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
                  @input="(value) => filterInput(value, 'password')"
                  :placeholder="$t('input.common.enter', { name: $t('input.common.password') })"
                />
                <div v-if="formData.password" class="w-full">
                  <div class="password-strength-bar">
                    <div
                      v-for="n in 4"
                      :key="n"
                      :class="['strength-segment', { active: n <= passwordStrength }]"
                    ></div>
                  </div>
                  <div class="password-strength" :class="passwordStrengthClass">
                    {{ passwordStrengthText }}
                  </div>
                </div>
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
                  :disabled="isEdit"
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
import zxcvbn from 'zxcvbn'
import { filterPasswordInput } from '@/Store/Helper/helpers'
import {ElMessage} from "element-plus";

export default {
  components: { AdminLayout, BreadCrumbComponent, BackBar },
  mixins: [form],
  props: {
    templatePermission: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      formData: {
        id: this.$route.params?.id,
        name: null,
        role_id: null,
        type: null,
        two_factor_enable: false,
        password: null,
        phone_number: null,
        status: 1,
        avatar: null,
      },
      fileInput: null,
      preview: null,
      isEdit: false,
      currentId: this.$route.params?.id,
      actions: [],
      roles: [],
      rules: {
        name: baseRuleValidate(this.$t)(this.$t('column.common.name')),
        email: baseRuleValidate(this.$t)(this.$t('input.common.email')),
        role_id: baseRuleValidate(this.$t)(this.$t('sidebar.role')),
        type: baseRuleValidate(this.$t)(this.$t('input.type-user')),
        password: baseRuleValidate(this.$t)(this.$t('input.common.password')),
        phone_number: baseRuleValidate(this.$t)(this.$t('input.phone-number'))
      },
      loadingForm: false,
      passwordStrength: 0
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
          name: this.isEdit ? 'breadcrumb.edit-user' : 'breadcrumb.create-user',
          route: ''
        }
      ]
    },
    titlePage() {
      return this.isEdit ? this.$t('back-bar.edit-user') : this.$t('back-bar.create-user')
    },
    passwordStrengthClass() {
      return `strength-${this.passwordStrength}`
    },
    passwordStrengthText() {
      const levels = ['Rất yếu', 'Yếu', 'Trung bình', 'Tốt', 'Mạnh']
      return levels[this.passwordStrength]
    }
  },
  watch: {
    'formData.password': function (val) {
      if (val) {
        const result = zxcvbn(val)
        this.passwordStrength = result.score
      }
    }
  },
  created() {
    if (this.$route.params?.id) {
      this.isEdit = true
      this.fetchData()
    }
    this.fetchRoles()
  },
  methods: {
    filterInput(value, field) {
      this.formData[field] = filterPasswordInput(value)
    },
    goBack() {
      this.$router.push({ name: 'user' })
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
          if (file.size > 2 * 1024 * 1024) {
              ElMessage.error("The file size cannot exceed 2MB. ");
              return;
          }
          const reader = new FileReader();
          reader.onload = (e) => {
              this.preview = e.target.result;
              this.formData.avatar = file;
          };
          reader.readAsDataURL(file);
      } else {
          ElMessage.error("Only image files can be uploaded. ");
      }
    },
    removeImage() {
        this.preview = null;
        this.$refs.fileInput.value = null;
        this.formData.avatar = null;
    },
    async submit() {
      // if(!this.isEdit) {
      //   if (this.passwordStrength < 2) {
      //     this.setErrors({ password: [this.$t('message.password-weak')] })
      //     this.$message.error(this.$t('message.password-weak'))
      //     return
      //   }
      // }
      this.loadingForm = true
      const { method, url } = this.prepareSubmit()
      await axios?.[method](url, this.formData, {
           headers: {
               'Content-Type': 'multipart/form-data'
           }
       }).then((response) => {
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
    prepareSubmit() {
      return {
        method: this.isEdit ? 'put' : 'post',
        url: this.isEdit ? `user/${this.currentId}` : 'user'
      }
    },
    async fetchRoles() {
      await axios
        .get('role', { params: { noPagination: true } })
        .then((response) => {
          this.roles = response?.data?.data
        })
        .catch((error) => {
          console.log(error)
          // this.$message.error(error?.response?.data?.message || this.$t('message.something-wrong'))
        })
    },
    async fetchData() {
      this.loadForm = true
      await axios
        .get(`user/${this.currentId}`)
        .then((response) => {
          this.formData = {
            id: response?.data?.data?.id,
            name: response?.data?.data?.name,
            email: response?.data?.data?.email,
            type: response?.data?.data?.type,
            two_factor_enable: response?.data?.data?.two_factor_enable,
            role_id: response?.data?.data?.role_ids[0],
            phone_number: response?.data?.data?.phone_number,
            avatar: response?.data?.data?.avatar
          }
          this.loadForm = false
        })
        .catch((error) => {
          this.$message.error(error?.response?.data?.message || this.$t('message.something-wrong'))
          this.loadForm = false
        })
    },
    onPhoneNumberInput(value) {
      const filteredValue = value.replace(/[^0-9]/g, ''); // Remove non-digit characters
      this.formData.phone_number = filteredValue;
    },
  }
}
</script>
<style>
.upload-container {
    width: 200px;
    height: 200px;
    border: 2px dashed #C1C1C1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
}

.upload-box {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.upload-placeholder {
    font-size: 48px;
    color: #aaa;
}

.image-preview {
    height: 100%;
}

.image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.remove-btn {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 24px;
    height: 24px;
    background-color: var(--tw-redD1);
    border: none;
    border-radius: 50%;
    color: white;
    font-size: 16px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}
</style>
