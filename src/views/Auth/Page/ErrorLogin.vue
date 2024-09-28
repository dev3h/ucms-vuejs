<template>
  <div class="flex items-center min-h-screen bg-grayF5 bg-gray-50">
    <el-card class="!max-w-[1000px] w-full my-10 mx-auto rounded-lg p-10">
      <div class="text-blueDark flex justify-between">
        <div class="flex-1">
          <div class="relative">
            <div class="logo mb-6">
              <img src="/images/logo.svg" alt="logo" class="h-[100px]" />
            </div>
          </div>
          <div class="text-zinc-800 text-2xl font-bold uppercase leading-[28.80px] mb-9">
            <div>
              <h3 class="font-bold text-2xl">{{ $t('auth-page.authorization-error') }}</h3>
            </div>
          </div>
        </div>
        <div class="flex-1">
          <p>{{ errorAuth }}</p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      errorAuth: this.$route?.query?.authError
    }
  },
  created() {
    console.log(this.$route)
  }
}
</script>

<style lang="scss" scoped></style>
