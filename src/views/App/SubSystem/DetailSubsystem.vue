<template>
  <div class="w-full py-5 px-4">
    <div class="box-content box-content3">
      <div class="box-content--item">
        <h3>{{ $t('column.common.code') }}</h3>
        <span>{{ item?.code }}</span>
      </div>
      <div class="box-content--item">
        <h3>{{ $t('column.common.name') }}</h3>
        <span>{{ item?.name }}</span>
      </div>
       <div class="box-content--item">
        <h3>{{ $t('sidebar.system') }}</h3>
        <router-link class='text-primary hover:opacity-80' :to="{ name: 'system-show', params: {id: item?.system?.id} }">{{ item?.system?.name }}</router-link>
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
