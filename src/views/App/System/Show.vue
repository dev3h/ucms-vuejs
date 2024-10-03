<template>
  <AdminLayout>
    <div class="w-full bg-white px-4">
      <div class="w-full pt-3 pb-2 border-b-[1px]">
        <BreadCrumbComponent :bread-crumb="setbreadCrumbHeader" />
      </div>
      <div class="w-full py-5">
        <div class="box-content box-content3">
          <div class="box-content--item">
            <h3>{{ $t('column.common.name') }}</h3>
            <span>{{ item?.name }}</span>
          </div>
          <div class="box-content--item">
            <h3>{{ $t('column.common.code') }}</h3>
            <span>{{ item?.code }}</span>
          </div>
          <div class="box-content--item">
            <h3>{{ $t('column.client-id') }}</h3>
            <div class="flex gap-1 items-center">
                <span>{{ item?.client_id }}</span>
                <img v-if="item?.client_id" class="cursor-pointer" src="/public/images/svg/copy.svg" alt="" @click="handleCopyToClipboard(item?.client_id)">
            </div>
          </div>
          <div class="box-content--item">
            <h3>{{ $t('column.client-secret') }}</h3>
            <div class="flex gap-1 items-center">
                <span>{{ item?.client_secret }}</span>
                <img v-if="item?.client_secret" class="cursor-pointer" src="/public/images/svg/copy.svg" alt="" @click="handleCopyToClipboard(item?.client_secret)">
            </div>
          </div>
           <div class="box-content--item">
            <h3>{{ $t('input.redirect-uri') }}</h3>
            <div class="flex gap-1 items-center">
                <span>{{ item?.redirect_uris }}</span>
                <img v-if="item?.redirect_uris" class="cursor-pointer" src="/public/images/svg/copy.svg" alt="" @click="handleCopyToClipboard(item?.client_secret)">
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import AdminLayout from '@/Layouts/AdminLayout.vue'
import BreadCrumbComponent from '@/components/Page/BreadCrumb.vue'
import { searchMenu } from '@/Mixins/breadcrumb.js'
import axios from '@/Plugins/axios'

export default {
  components: { AdminLayout, BreadCrumbComponent },
  data() {
    return {
      item: null,
      id: this.$route.params.id
    }
  },
  computed: {
    setbreadCrumbHeader() {
      let menuOrigin = searchMenu()
      return [
        {
          name: menuOrigin?.label,
          route: 'system'
        },
        {
          name: this.item?.name,
          route: '',
          isNoTranslate: true
        }
      ]
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'system' })
    },
    async fetchData() {
      await axios
        .get(`/system/${this.id}`)
        .then((response) => (this.item = response?.data?.data))
        .catch((error) => {
          this.$message({
            type: 'error',
            message: error.response.data.message || this.$t('something-wrong')
          })
        })
    },
    handleCopyToClipboard(value) {
      navigator.clipboard.writeText(value)
      this.$message({
        type: 'success',
        message: this.$t('message.copy-success')
      })
    }
  }
}
</script>