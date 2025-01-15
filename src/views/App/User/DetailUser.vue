<template>
  <div class="w-full py-5 px-4">
    <div class="box-content box-content3">
      <div class="box-content--item">
        <h3>{{ $t('column.common.name') }}</h3>
        <span>{{ item?.name }}</span>
      </div>
      <div class="box-content--item">
        <h3>{{ $t('input.common.email') }}</h3>
        <span>{{ item?.email }}</span>
      </div>
      <div class="box-content--item">
        <h3>{{ $t('input.phone-number') }}</h3>
        <span>{{ item?.phone_number }}</span>
      </div>
      <div class="box-content--item">
        <h3>{{ $t('input.type-user') }}</h3>
        <span>{{ item?.type === 1 ? $t('input.admin') : $t('input.user') }}</span>
      </div>
      <div class="box-content--item">
        <h3>{{ $t('column.2fa') }}</h3>
        <span>{{ item?.two_factor_enable ? $t('button.enable') : $t('button.disable') }}</span>
      </div>
      <div class="box-content--item">
        <h3>{{ $t('sidebar.role') }}</h3>
        <div class="flex gap-1">
          <span
            v-for="(role, index) in item?.roles"
            :key="index"
            class="bg-gray-200 rounded-full px-2 py-1 text-sm mr-2"
          >
            {{ role }}
          </span>
        </div>
      </div>
      <div class="box-content--item">
        <h3>{{ $t('column.common.status') }}</h3>
        <div class="flex gap-1">
          <span
            class="rounded-[50px] px-4 py-1"
            :class="item?.status === 1 ? 'bg-green-500' : 'bg-red-400'"
          >
            {{ item?.status === 1 ? $t('button.active') : $t('button.suspend') }}
          </span>
        </div>
      </div>
      <div class="box-content--item" v-if="item?.type !== 1">
        <div class="flex gap-1 items-end h-full">
          <el-button type="success" @click="handleResetTwoFactor">{{
            $t('button.reset-2fa')
          }}</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/Plugins/axios'

export default {
  props: {
    item: {
      type: Object
    }
  },
  methods: {
    async handleResetTwoFactor() {
      try {
        const response = await axios.post(`/user/${this.item.id}/reset-2fa`)
        if (response?.data?.status_code === 200) {
          this.$message.success(response?.data?.message)
        }
      } catch (err) {
        this.$message.error(err?.response?.data?.message || this.$t('message.something-wrong'))
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
