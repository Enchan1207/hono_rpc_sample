<script setup lang="ts">
import { ref } from 'vue'
import {
  Expand, Fold, Sunny, Moon,
} from '@element-plus/icons-vue'
import {
  breakpointsElement, useBreakpoints, useDark, useToggle,
} from '@vueuse/core'
import Sidebar from '@/components/SideBar.vue'

const breakpoints = useBreakpoints(breakpointsElement)
const isSmartphone = breakpoints.isSmaller('sm')

const isDark = useDark()
const toggleDark = useToggle(isDark)

const isSidebarVisible = ref(!isSmartphone)
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
        <span>
          <el-switch
            :model-value="isDark"
            :active-action-icon="Moon"
            :inactive-action-icon="Sunny"
            class="color-mode-switch"
            @change="toggleDark()"
          />
        </span>
      </el-row>
    </el-header>
    <el-container>
      <template v-if="!isSmartphone">
        <transition name="sidebar-slide">
          <el-aside v-show="isSidebarVisible">
            <Sidebar />
          </el-aside>
        </transition>
      </template>
      <template v-else>
        <el-drawer
          v-model="isSidebarVisible"
          title="Tasks"
          direction="ltr"
          size="70%"
          body-class="drawer-body"
        >
          <Sidebar
            @select="isSidebarVisible = false"
          />
        </el-drawer>
      </template>

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
  border-bottom: 1px solid var(--el-menu-border-color);
  align-items: center;
  user-select: none;
}

.el-header .el-row {
  align-items: center;
  height: 100%;
}

.el-header .sidebar-button-wrapper {
  padding-right: 20px;
}

.el-header h1 {
  flex: 1;
  font-weight: normal;
  margin: 0;
}

.el-aside {
  border-right: 1px solid var(--el-menu-border-color);
}

.drawer-body {
  padding: 0;
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

.color-mode-switch {
  --el-switch-on-color: var(--el-color-info);
  --el-switch-off-color: var(--el-color-info);
}

.root-container {
  height: 100vh;
}

.el-main {
  height: calc(100vh - var(--el-header-height));
}
</style>
