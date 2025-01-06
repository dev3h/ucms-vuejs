<template>
  <AdminLayout>
    <div class="w-full h-full bg-white px-4">
      <div class="w-full pt-3 pb-2">
        <BreadCrumbComponent :bread-crumb="setbreadCrumbHeader" />
      </div>
      <Statistic />
    </div>
  </AdminLayout>
</template>
<script>
import AdminLayout from '@/Layouts/AdminLayout.vue'
import BreadCrumbComponent from '@/components/Page/BreadCrumb.vue'
import { searchMenu } from '@/Mixins/breadcrumb.js'
import Statistic from './Statistic.vue'

export default {
  components: { AdminLayout, BreadCrumbComponent, Statistic },
  data() {
    return {
      items: [],
      number: 0
    }
  },
  computed: {
    setbreadCrumbHeader() {
      let menuOrigin = searchMenu()
      return [
        {
          name: menuOrigin?.label,
          route: 'dashboard'
        }
      ]
    }
  },
  async created() {},
  methods: {}
}
</script>
<style></style>
