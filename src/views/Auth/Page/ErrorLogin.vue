<template>
  <div class="flex items-center min-h-screen bg-grayF5">
    <el-card class="!max-w-[1000px] w-full my-10 mx-auto rounded-lg p-10">
       <div class="flex-1">
          <div class="relative">
            <div class="logo mb-6">
              <img src="/images/logo.svg" alt="logo" class="h-[50px]" />
            </div>
          </div>
        </div>
       <div class="flex-1 flex justify-between">
            <div class="w-1/2 text-zinc-800 text-2xl font-bold uppercase leading-[28.80px] mb-9">
            <div>
              <h3 class="font-bold text-2xl">{{ $t('auth-page.authorization-error') }}</h3>
            </div>
          </div>
          <p class='flex-1'>{{ errorAuth }}</p>
        </div>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    let errorAuth = null
    try {
      const authError = this.$route?.query?.authError
      if (authError) {
        errorAuth = decodeURIComponent(authError)
      }
    } catch (e) {
      errorAuth = null
    }

    return {
      errorAuth
    }
  }
}
</script>

<style lang="scss" scoped></style>
