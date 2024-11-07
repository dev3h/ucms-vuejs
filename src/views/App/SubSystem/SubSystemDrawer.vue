<template>
  <el-drawer
    v-model="isShowDrawer"
    title="I have a nested table inside!"
    direction="rtl"
    size="50%"
  >
    <h1>hello</h1>
  </el-drawer>
</template>

<script>
export default {
  data() {
    return {
      isShowDrawer: false
    }
  },
  methods: {
    open() {
      this.isShowDrawer = true
    }
  }
}
</script>
