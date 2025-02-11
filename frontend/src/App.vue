<script setup lang="ts">
import { ref } from 'vue'
import { Expand, Fold } from '@element-plus/icons-vue'
import Sidebar from '@/components/SideBar.vue'

const isSidebarVisible = ref(true)
</script>

<template>
  <el-container class="root-container">
    <el-header>
      <el-row>
        <span class="sidebar-button-wrapper">
          <el-button
            :icon="isSidebarVisible ? Fold : Expand"
            @click="isSidebarVisible = !isSidebarVisible"
          />
        </span>
        <h1>Tasks</h1>
      </el-row>
    </el-header>
    <el-container>
      <transition name="sidebar-slide">
        <el-aside v-show="isSidebarVisible">
          <Sidebar />
        </el-aside>
      </transition>

      <el-main>
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<style>
:root{
  --el-aside-width: 200px;
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
  align-items: center;
}

.el-header .el-row {
  align-items: center;
  height: 100%;
}

.el-header .sidebar-button-wrapper {
  padding-right: 20px;
}

.el-header h1 {
  font-weight: normal;
  margin: 0;
}

.el-aside {
  border-right: 1px solid var(--el-menu-border-color);
}

.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: all 0.2s ease-out;
}
.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  --el-aside-width: 0;
  opacity: 0;
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
