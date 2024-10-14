<template>
  <el-aside width="300px" style="background-color: #f5f7fa">
    <el-input
      :value="filterText"
      @input="$emit('update:filterText', $event)"
      placeholder="Search system/module..."
      clearable
    ></el-input>
    <el-tree
      :data="treeData"
      :props="defaultProps"
      :filter-node-method="filterNode"
      @node-click="handleNodeClick"
      ref="tree"
      default-expand-all
      highlight-current
    />
  </el-aside>
</template>

<script>
export default {
  props: {
    treeData: Array,
    defaultProps: Object,
    filterText: String
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      return data.label.toLowerCase().includes(value.toLowerCase());
    },
    handleNodeClick(nodeData) {
      this.$emit('node-click', nodeData);
    }
  }
};
</script>

<style>
.el-tree {
  height: calc(100vh - 50px);
  overflow-y: auto;
}
</style>