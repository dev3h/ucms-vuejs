<template>
  <el-dialog
    v-model="isShowModal"
    :close-on-click-modal="false"
    :before-close="closeModal"
    :fullscreen="fullscreen"
    class="dialog-base"
  >
    <template #header>
      <DialogHeader
        :title="$t('dialog.choose-csv-file')"
        :isFullscreen="fullscreen"
        @toggleFullscreen="handleToggleFullScreen"
      />
    </template>
    <div class="w-full">
      <div class="flex justify-around">
        <el-form
          class="w-full grid grid-col lg:grid-cols-2 gap-5"
          ref="form"
          :model="formData"
          label-position="top"
        >
          <div class="col-span-1">
            <el-form-item
              class="title--bold"
              prop="file"
              :error="getError('file')"
              :inline-message="hasError('file')"
            >
              <input ref="fileImport" type="file" @change="handleFileChange" accept=".csv" />
            </el-form-item>
          </div>
        </el-form>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-center items-center">
        <el-button type="info" size="large" @click="closeModal">{{ $t('button.close') }}</el-button>
        <el-button
          :loading="isLoading"
          :disabled="!formData.file"
          type="primary"
          size="large"
          @click="handleUploadCsv"
          >{{ $t('button.upload') }}</el-button
        >
      </div>
    </template>
  </el-dialog>
  <PreviewCsvDialog ref="previewCsvDialog" :fetchData="fetchData" />
</template>

<script>
import DialogHeader from '@/components/Dialog/DialogHeader.vue'
import form from '@/Mixins/form.js'
// import axios from '@/Plugins/axios'
import PreviewCsvDialog from './PreviewCsvDialog.vue'
import Papa from 'papaparse';

export default {
  components: { DialogHeader, PreviewCsvDialog },
  mixins: [form],
  emits: ['close-modal'],
  props: {
    fetchData: {
      type: Function
    }
  },
  data() {
    return {
      isShowModal: false,
      fullscreen: false,
      formData: {
        file: null
      },
      isLoading: false,
      requiredHeaders: [
        'name',
        'email',
        'phone_number',
        'password',
        'role_id',
        'type',
        'two_factor_enable',
      ],
    }
  },
  methods: {
    async open() {
      this.isShowModal = true
    },
    closeModal() {
      this.isShowModal = false
      this.$emit('close-modal')
    },
    handleToggleFullScreen() {
      this.fullscreen = !this.fullscreen
    },
    handleFileChange(event) {
      const file = event.target.files[0]
      
      this.formData.file = file
    },
    // async handleUploadCsv() {
    //   if (!this.formData.file) {
    //     this.$message.error(this.$t('message.no-file-selected'))
    //     return
    //   }

    //   const formData = new FormData()
    //   formData.append('file', this.formData.file)

    //   try {
    //     const response = await axios.post('/user/import-csv', formData, {
    //       headers: {
    //         'Content-Type': 'multipart/form-data'
    //       }
    //     })
    //     if (response?.data?.status_code === 200) {
    //       const dataRes = response?.data?.data
    //       if (dataRes?.length > 0) {
    //         this.isShowModal = false
    //         this.$refs.previewCsvDialog.open(dataRes)
    //       }
    //       this.$refs.fileImport.value = ''
    //       this.formData.file = null
    //     }
    //   } catch (error) {
    //     this.$message.error(error?.response?.data?.message || this.$t('message.something-wrong'))
    //   }
    // }
    async handleUploadCsv() {
      if (!this.formData.file) {
        this.$message.error(this.$t('message.no-file-selected'));
        return;
      }
      this.isLoading = true;
      const file = this.formData.file;

      Papa.parse(file, {
        header: true, // Parse the CSV with headers
        skipEmptyLines: true,
        complete: (result) => {
          if (result?.data?.length > 0) {
            const data = result.data; // Parsed CSV data
            const headers = result?.meta?.fields;
            const missingHeaders = this.requiredHeaders.filter((header) => !headers.includes(header));
            if (missingHeaders.length > 0) {
              this.$message.error(this.$t('message.missing-headers', { headers: missingHeaders.join(', ') }));
              this.isLoading = false;
              return;
            }
            this.isShowModal = false;
            this.$refs.previewCsvDialog.open(data);
          } else {
            this.$message.error(this.$t('message.no-data-in-file'));
          }
          this.$refs.fileImport.value = '';
          this.formData.file = null;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error parsing CSV file:', error);
          this.isLoading = false;
          this.$message.error(this.$t('message.invalid-file'));
        },
      });
    },
  }
}
</script>
