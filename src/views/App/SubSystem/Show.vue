<template>
  <AdminLayout>
    <div class="w-full h-full bg-white px-4">
      <div class="w-full pt-3 pb-2">
        <BreadCrumbComponent :bread-crumb="setbreadCrumbHeader" />
      </div>
      <BackBar route-back="subsystem" :title="item?.name || ''"> </BackBar>
      <div class="w-full py-[12px] pr-4">
        <div class="mt-2 border-b-[1px] border-[#8A8A8A] flex gap-[4px]">
          <div
            v-for="tab in tabs"
            :key="tab.id"
            class="text-center px-[12px] py-[4px] rounded-t-[4px] cursor-pointer"
            :class="{
              'bg-primary text-white': tabActive === tab.id,
              'bg-[#F4F4F4] text-[#8A8A8A]': tabActive !== tab.id
            }"
            @click="changeTab(tab.id)"
          >
            {{ tab.label }}
          </div>
        </div>
      </div>
      <div class="w-full" v-if="tabActive === 1">
        <detailSubsystem :item="item" />
      </div>
      <div class="w-full" v-if="tabActive === 2">
        <ModuleTab :id="id" />
      </div>
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
// import GeneralTab from '.SubSystemDrawer.vue'
import ModuleTab from './ModuleTab.vue'
import DetailSubsystem from './DetailSubsystem.vue'
export default {
  components: { AdminLayout,BackBar, BreadCrumbComponent, ModuleTab, DetailSubsystem },
  mixins: [form],
  data() {
    return {
      tabActive: 1,
      tabs: [
        {
          id: 1,
          label: this.$t('button.general')
        },
        {
          id: 2,
          label: this.$t('sidebar.module')
        }
      ],
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
          route: 'subsystem'
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
      this.$router.push({ name: 'subsystem' })
    },
    async fetchData() {
      await axios
        .get(`/subsystem/${this.id}`)
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
