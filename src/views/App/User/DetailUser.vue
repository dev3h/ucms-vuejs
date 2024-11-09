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
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
    }
  }
}
</script>

<style lang="scss" scoped></style>
