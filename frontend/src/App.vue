<script setup lang="ts">
import Sidebar from '@/components/SideBar.vue'

</script>

<template>
  <el-container class="root-container">
    <el-header>
      <h1>Simple ToDo</h1>
    </el-header>
    <el-container>
      <el-aside>
        <Sidebar />
      </el-aside>
      <el-main>
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<style>
:root{
  --el-header-height: 60px;
}

html, body {
  margin: 0;
  padding: 0;
}

.el-header {
  --el-header-height: unset;
  border-bottom: 1px #aaa solid;
  background: white;
}

.el-header h1 {
  margin: 0;
  line-height: var(--el-header-height);
}

.el-aside {
  border-right: 1px solid var(--el-menu-border-color);
}

.el-menu {
  border-right: none;
}

.root-container {
  height: 100vh;
}

.el-main {
  height: calc(100vh - var(--el-header-height));
  padding: 0 var(--el-main-padding);
}
</style>
