<template>
  <div>
    <div class="flex gap-4 justify-center">
      <input
        v-for="(input, index) in inputs"
        :key="index"
        v-model="inputs[index]"
        @input="handleInput($event, index)"
        @keydown="handleKeydown($event, index)"
        @paste="handlePaste($event)"
        @blur="validateInputs"
        type="text"
        maxlength="1"
        class="otp-input"
        :class="{ '!border-redD1': !inputs[index] && isSubmitted }"
      />
    </div>
    <div v-if="isSubmitted && inputs.some((input) => input === '')" class="mt-2 text-center">
      <span class="text-redD1 text-xs">{{
        $t('validate.required', { column: $t('column.common.code') })
      }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OtpInput',
  props: {
    length: {
      type: Number,
      default: 6
    }
  },
  data() {
    return {
      inputs: Array(this.length).fill(''),
      isSubmitted: false
    }
  },
  methods: {
    handleInput(event, index) {
      const value = event.target.value

      if (/^\d$/.test(value)) {
        this.inputs[index] = value
        if (index < this.length - 1) {
          event.target.nextElementSibling?.focus()
        }
      } else {
        this.inputs[index] = ''
      }

      if (this.inputs.every((input) => input !== '')) {
        this.$emit('enterCodeComplete', this.inputs.join(''))
      }
    },
    handlePaste(event) {
      const pasteData = event.clipboardData.getData('text')
      if (/^\d{6}$/.test(pasteData)) {
        this.inputs = pasteData.split('')
        this.$emit('enterCodeComplete', this.inputs.join(''))
      }
    },
    handleKeydown(event, index) {
      if (event.key === 'Backspace' && this.inputs[index] === '' && index > 0) {
        this.inputs[index - 1] = ''
        event.target.previousElementSibling?.focus()
      }
    },
    validateInputs() {
      this.isSubmitted = true
      if (this.inputs.some((input) => input === '')) {
        this.$emit('validationFailed')
      }
    }
  },
  watch: {
    inputs(newInputs) {
      if (newInputs.every((input) => input !== '')) {
        this.isSubmitted = false
      }
    }
  }
}
</script>

<style>
.otp-input {
  width: 40px;
  height: 40px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.3s;
}

.otp-input:focus {
  border-color: var(--tw-primary) !important;
}
</style>
