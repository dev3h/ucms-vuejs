<template>
  <Head title="Two-factor Confirmation" />

  <AuthenticationCard>
    <template #logo>
      <img src="/images/logo.svg" alt="logo" />
    </template>

    <div class="mb-4 text-sm text-center">
      <template v-if="!recovery">
        {{ $t('auth-page.2fa-challenge-page.title') }}
      </template>

      <template v-else>
        {{ $t('auth-page.2fa-challenge-page.title-recovery') }}
      </template>
    </div>

    <form @submit.prevent="submit">
      <div v-if="!recovery">
        <InputLabel for="code" :value="$t('column.common.code')" />
        <TextInput
          id="code"
          ref="codeInput"
          v-model="formData.code"
          type="text"
          inputmode="numeric"
          class="mt-1 block w-full"
          autofocus
          autocomplete="one-time-code"
        />
        <InputError class="mt-2" :message="form?.errors?.code" />
      </div>

      <div v-else>
        <InputLabel for="recovery_code" :value="$t('input.recovery-code')" />
        <TextInput
          id="recovery_code"
          ref="recoveryCodeInput"
          v-model="formData.recovery_code"
          type="text"
          class="mt-1 block w-full"
          autocomplete="one-time-code"
        />
        <InputError class="mt-2" :message="form?.errors?.recovery_code" />
      </div>

      <div class="flex flex-col justify-center mt-9 gap-4">
        <el-button
          type="primary"
          :class="{ 'opacity-25': form?.processing }"
          :disabled="form?.processing"
          @click="submit"
          >{{ $t('button.verify') }}</el-button
        >
        <el-button
          class="text-sm text-gray-600 hover:text-gray-900 cursor-pointer !ml-0"
          @click.prevent="toggleRecovery"
        >
          <template v-if="!recovery">
            {{ $t('button.recovery-code') }}
          </template>

          <template v-else>
            {{ $t('button.auth-code') }}
          </template>
        </el-button>
      </div>
    </form>
  </AuthenticationCard>
</template>

<script>
import AuthenticationCard from '@/components/Page/AuthenticationCard.vue'
import InputError from '@/components/Page/InputError.vue'
import InputLabel from '@/components/Page/InputLabel.vue'
import TextInput from '@/components/Page/TextInput.vue'

export default {
  components: {
    AuthenticationCard,
    InputError,
    InputLabel,
    TextInput
  },
  data() {
    return {
      recovery: false,
      formData: {
        code: '',
        recovery_code: ''
      },
      recoveryCodeInput: null,
      codeInput: null
    }
  },
  methods: {
    async toggleRecovery() {
      this.recovery = !this.recovery

      await this.$nextTick()

      if (this.recovery) {
        this.$refs.recoveryCodeInput.focus()
        this.form.code = ''
      } else {
        this.$refs.codeInput.focus()
        this.form.recovery_code = ''
      }
    },
    submit() {
      this.form.post(this.route('two-factor.login'))
    }
  }
}
</script>
