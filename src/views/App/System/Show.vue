<template>
  <AdminLayout>
    <div class="w-full bg-white">
      <div class="w-full pt-3 pb-2 px-4">
        <BreadCrumbComponent :bread-crumb="setbreadCrumbHeader" />
      </div>
      <BackBar route-back="system" :title="item?.name"> </BackBar>
      <div class="w-full py-5 px-4">
        <div class="flex justify-start gap-10">
          <div class="flex-1">
            <div class="box-content--item">
              <h3>{{ $t('column.common.name') }}</h3>
              <span>{{ item?.name }}</span>
            </div>
            <div class="box-content--item">
              <h3>{{ $t('column.common.code') }}</h3>
              <span>{{ item?.code }}</span>
            </div>
            <div class="box-content--item col-span-3">
              <h3>{{ $t('input.redirect-uri') }}</h3>
              <div class="flex flex-col gap-2">
                <div
                  v-for="(uri, index) in item?.redirect_uris"
                  :key="index"
                  class="flex gap-1 items-center"
                >
                  <span>{{ $t('column.url') }} {{ index + 1 }}: {{ uri }}</span>
                  <img
                    class="cursor-pointer"
                    src="/public/images/svg/copy.svg"
                    alt=""
                    @click="handleCopyToClipboard(uri)"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="flex-1">
            <div class="box-content--item">
              <h3>{{ $t('column.client-id') }}</h3>
              <div class="flex gap-1 items-center">
                <span>{{ item?.client_id }}</span>
                <img
                  v-if="item?.client_id"
                  class="cursor-pointer"
                  src="/public/images/svg/copy.svg"
                  alt=""
                  @click="handleCopyToClipboard(item?.client_id)"
                />
              </div>
            </div>
            <div class="box-content--item">
              <h3>{{ $t('column.client-secret') }}</h3>
              <div>
                <div
                  v-for="cs in item?.client_secrets"
                  :key="cs?.id"
                  class="flex flex-col gap-2 border-b border-grayF0"
                >
                  <div class="mt-5">
                    <div class="flex justify-between items-center gap-1">
                      <span>Client secret: {{ cs?.client_secret }}</span>
                      <div class="flex gap-2 items-center">
                        <div
                          class="cursor-pointer"
                          @click="handleCopyToClipboard(cs?.client_secret)"
                        >
                          <img src="/public/images/svg/copy.svg" alt="" />
                        </div>
                        <div class="cursor-pointer" @click="openDeleteForm(cs?.id)">
                          <img src="/images/svg/trash-icon.svg" alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span>{{ $t('column.common.created-at') }}: {{ cs.created_at }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span
                      >{{ $t('column.common.status') }}:
                      <el-switch
                        v-model="cs.is_enabled"
                        :before-change="(newStatus) => handleChangeStatus(cs?.id)"
                      />
                      {{ cs.is_enabled ? $t('button.enable') : $t('button.disable') }}
                    </span>
                  </div>
                </div>
                <div
                  class="mt-8 font-bold cursor-pointer hover:opacity-75"
                  @click="createNewClientSecret"
                >
                  <span>+</span>
                  <span>{{ $t('button.add-client-secret') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="py-5 px-4">
        <vue-tree
          class="!w-full h-[500px] border border-gray-500"
          :dataset="treeData"
          :config="treeConfig"
          linkStyle="straight"
        >
          <template v-slot:node="{ node, collapsed }">
            <div
              class="rich-media-node ml-1 p-1 relative"
              :style="{
                border: collapsed ? '2px solid grey' : '',
                backgroundColor: getNodeColor(node.type)
              }"
              @contextmenu.prevent="showContextMenu($event, node)"
            >
              <span style="padding: 4px 0; font-weight: bold">{{ node.name }}</span>
              <span style="padding: 4px 0; font-style: italic; color: gray">
                ({{ getNodeLabel(node.type) }})
              </span>
              <ContextMenu ref="menu" />
            </div>
          </template>
        </vue-tree>
      </div>
    </div>
    <DeleteForm ref="deleteForm" @delete-action="deleteItem" />
  </AdminLayout>
</template>

<script>
import AdminLayout from '@/Layouts/AdminLayout.vue'
import BreadCrumbComponent from '@/components/Page/BreadCrumb.vue'
import { searchMenu } from '@/Mixins/breadcrumb.js'
import DeleteForm from '@/components/Page/DeleteForm.vue'
import axios from '@/Plugins/axios'
import BackBar from '@/components/BackBar/Index.vue'
import VueTree from '@ssthouse/vue3-tree-chart/'
import '@ssthouse/vue3-tree-chart/dist/vue3-tree-chart.css'
import ContextMenu from './ContextMenu.vue'

export default {
  components: { AdminLayout, BreadCrumbComponent, BackBar, VueTree, DeleteForm, ContextMenu },
  data() {
    return {
      item: null,
      id: this.$route.params.id,
      treeData: [],
      treeConfig: { nodeWidth: 120, nodeHeight: 80, levelHeight: 200 },
      deleteForm: null,
      menu: null
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
    showContextMenu(event, node) {
      this.$refs.menu.open(node)
      // this.contextMenuStyle.top = `${event.clientY}px`;
      // this.contextMenuStyle.left = `${event.clientX}px`;
      // this.contextMenuVisible = true;
    },
    getNodeLabel(type) {
      switch (type) {
        case 'system':
          return 'Hệ thống'
        case 'subsystem':
          return 'Phân hệ'
        case 'module':
          return 'Mô đun'
        case 'action':
          return 'Thao tác'
        default:
          return ''
      }
    },
    getNodeColor(type) {
      switch (type) {
        case 'system':
          return '#FFDDC1' // Light orange
        case 'subsystem':
          return '#C1E1FF' // Light blue
        case 'module':
          return '#C1FFC1' // Light green
        case 'action':
          return '#FFC1C1' // Light red
        default:
          return '#FFFFFF' // Default white
      }
    },
    async fetchData() {
      try {
        const response = await axios.get(`/system/${this.id}`)
        this.item = response?.data?.data
        this.treeData = transformData(this.item)
      } catch (error) {
        this.$message({
          type: 'error',
          message: error.response.data.message || this.$t('something-wrong')
        })
      }
    },
    handleCopyToClipboard(value) {
      navigator.clipboard.writeText(value)
      this.$message({
        type: 'success',
        message: this.$t('message.copy-success')
      })
    },
    openDeleteForm(clientSecretId) {
      this.$refs.deleteForm.open(clientSecretId)
    },
    async createNewClientSecret() {
      try {
        const response = await axios.post(`/system/${this.id}/create-new-client-secret`)
        this.$message({
          type: 'success',
          message: response?.data?.message
        })
        this.fetchData()
      } catch (error) {
        this.$message({
          type: 'error',
          message: error.response.data.message || this.$t('something-wrong')
        })
      }
    },
    async handleChangeStatus(clientSecretId) {
      try {
        const response = await axios.put(
          `/system/${this.id}/update-client-secret/${clientSecretId}`
        )
        this.$message({
          type: 'success',
          message: response?.data?.message
        })
        this.fetchData()
      } catch (error) {
        this.$message({
          type: 'error',
          message: error.response.data.message || this.$t('something-wrong')
        })
      }
    },
    async deleteItem(clientSecretId) {
      await axios
        .delete(`/system/${this.id}/delete-client-secret/${clientSecretId}`)
        .then((response) => {
          this.$message.success(response?.data?.message)
          this.fetchData()
        })
        .catch((error) => {
          this.$message.error(error?.response?.data?.message)
        })
    }
  }
}
function transformData(data) {
  const treeData = {
    name: data.name,
    customID: data.id,
    type: 'system',
    children: data.subsystems.map((subsystem) => ({
      name: subsystem.name,
      customID: subsystem.id,
      type: 'subsystem',
      children: subsystem.modules.map((module) => ({
        name: module.name,
        customID: module.id,
        type: 'module',
        children: module.actions.map((action) => ({
          name: action.name,
          customID: action.id,
          type: 'action'
        }))
      }))
    })),
    links: [
      { parent: 1, child: 2 },
      { parent: 3, child: 2 },
      { parent: 4, child: 2 }
    ]
  }

  return { ...treeData, identifier: 'customID' }
}
</script>
