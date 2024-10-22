<template>
  <div class="bg-grayF5 py-[10px] px-4 flex items-center justify-between h-14">
    <div class="flex items-center gap-5">
      <router-link :to="{ name: routeBack }" class="hover:opacity-90">
        <img src="/images/svg/back.svg" alt="" />
      </router-link>
      <span class="text-[#333333] text-[16px] font-bold">{{ title }}</span>
      <slot name="leftBackBar" />
    </div>
    <slot name="actionBackBar" />
  </div>
</template>

<script>
export default {
  props: {
    routeBack: {
      type: String,
      required: true
    },
    title: {
      type: String
    }
  }
}
</script>
