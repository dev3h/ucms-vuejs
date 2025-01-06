<template>
  <div
    v-if="contextMenuVisible"
    :style="contextMenuStyle"
    class="context-menu !bg-red-500 !absolute"
  >
    <ul>
      <li @click="handleMenuAction('action1')">Action 1</li>
      <li @click="handleMenuAction('action2')">Action 2</li>
      <li @click="handleMenuAction('action3')">Action 3</li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      contextMenuVisible: false,
      contextMenuStyle: {
        top: '0px',
        left: '0px'
      },
      node: null
    }
  },
  methods: {
    open(node) {
        this.node = node;
        this.$nextTick(() => {
          this.contextMenuVisible = true;
        });
        document.addEventListener('click', this.hideContextMenu);
    },
     hideContextMenu() {
      this.contextMenuVisible = false;
      document.removeEventListener('click', this.hideContextMenu);
    },
    handleMenuAction(action) {
      console.log(`Action selected: ${action}`);
      this.hideContextMenu();
    },
  }
}
</script>

<style>
.context-menu {
  position: absolute;
  background-color: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}
.context-menu ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.context-menu li {
  padding: 8px 12px;
  cursor: pointer;
}
.context-menu li:hover {
  background-color: #eee;
}
</style>
