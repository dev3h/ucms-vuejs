<template>
  <AdminLayout>
    <div class="w-full bg-white">
      <div class="w-full pt-3 pb-2 px-4">
        <BreadCrumbComponent :bread-crumb="setbreadCrumbHeader" />
      </div>
      <BackBar route-back="user" :title="item?.name || ''"> </BackBar>
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
          <div
            class="text-center px-[12px] py-[4px] rounded-t-[4px] cursor-pointer"
            :class="{
              'bg-primary text-white': tabActive === 2,
              'bg-[#F4F4F4] text-[#8A8A8A]': tabActive !== 2
            }"
            @click="changeTab(2)"
          >
            {{ $t('sidebar.permission') }}
          </div>
        </div>
      </div>
      <DetailUser :item="item" v-if="tabActive === 1" />
      <AssignPermission :id="id" v-if="tabActive === 2" />
    </div>
  </AdminLayout>
</template>
<script>
import AdminLayout from '@/Layouts/AdminLayout.vue'
import BreadCrumbComponent from '@/components/Page/BreadCrumb.vue'
import { searchMenu } from '@/Mixins/breadcrumb.js'
import form from '@/Mixins/form.js'
import axios from '@/Plugins/axios'
import BackBar from '@/components/BackBar/Index.vue'
import DetailUser from './DetailUser.vue'
import AssignPermission from './AssignPermission.vue'

export default {
  components: { DetailUser, AdminLayout, AssignPermission, BreadCrumbComponent, BackBar },
  mixins: [form],
  data() {
    return {
      tabActive: 1,
      actions: [],
      loadingForm: false,
      id: this.$route.params.id,
      item: null
    }
  },
  computed: {
    setbreadCrumbHeader() {
      let menuOrigin = searchMenu()
      return [
        {
          name: menuOrigin?.label,
          route: 'user'
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
      this.$router.push({ name: 'user' })
    },
    async fetchData() {
      await axios
        .get(`/user/${this.id}`)
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
