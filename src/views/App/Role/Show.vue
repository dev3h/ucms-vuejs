<template>
  <AdminLayout>
    <div class="w-full px-4 bg-white">
      <div class="w-full pt-3 pb-2 border-b-[1px]">
        <BreadCrumbComponent :bread-crumb="setbreadCrumbHeader" />
      </div>
      <div class="w-full py-[12px] pr-4">
        <div class="mt-2 border-b-[1px] border-[#8A8A8A] flex gap-[4px]">
          <div
            class="text-center px-[12px] py-[4px] rounded-t-[4px] cursor-pointer"
            :class="{
              'bg-primary text-white': tabActive === 1,
              'bg-[#F4F4F4] text-[#8A8A8A]': tabActive !== 1
            }"
            @click="changeTab(1)"
          >
            {{ $t('button.general') }}
          </div>
        </div>
      </div>
      <div class="w-full" v-if="tabActive === 1">
        <DetailRole :item="item" />
      </div>
    </div>
  </AdminLayout>
</template>
<script>
import AdminLayout from '@/Layouts/AdminLayout.vue'
import BreadCrumbComponent from '@/components/Page/BreadCrumb.vue'
import { searchMenu } from '@/Mixins/breadcrumb.js'
import axios from '@/Plugins/axios'
import DetailRole from './DetailRole.vue'
export default {
  components: { DetailRole, AdminLayout, BreadCrumbComponent },
  data() {
    return {
      id: this.$route.params.id,
      item: null,
      tabActive: 1,
      loadingForm: false
    }
  },
  computed: {
    setbreadCrumbHeader() {
      let menuOrigin = searchMenu()
      return [
        {
          name: menuOrigin?.label,
          route: 'role'
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
      this.$router.push({ name: 'role' })
    },
    async fetchData() {
      await axios
        .get(`/role/${this.id}`)
        .then((response) => (this.item = response?.data?.data))
        .catch((error) => {
          this.$message({
            type: 'error',
            message: error.response.data.message || this.$t('something-wrong')
          })
        })
    },
    changeTab(tab) {
      this.tabActive = tab
    }
  }
}
</script>
<style></style>
