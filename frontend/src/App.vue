<script setup lang="ts">
import { ref, watch } from 'vue'
import { Expand, Fold } from '@element-plus/icons-vue'
import { breakpointsElement, useBreakpoints } from '@vueuse/core'
import Sidebar from '@/components/SideBar.vue'

const breakpoints = useBreakpoints(breakpointsElement)
const isSmartphone = breakpoints.smaller('sm')
watch(isSmartphone, (newValue, prevValue) => {
  // スマホビューではサイドバーはドロワーになるため、いったん閉じる
  const isTransitionToSmartphone = prevValue === false && newValue === true
  isSidebarVisible.value = !isTransitionToSmartphone
})

const isSidebarVisible = ref(!isSmartphone.value)
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
          size="var(--el-aside-width)"
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
:root {
  --el-main-padding: 20px;
  --el-aside-width: 220px;
  --el-header-height: 60px;
  --el-font-family: "Helvetica Neue",
    Arial,
    "Hiragino Kaku Gothic ProN",
    "Hiragino Sans",
    Meiryo,
    sans-serif;
  font-family: var(--el-font-family);
}

@media (max-width: 768px) {
  :root {
    --el-main-padding: 10px;
    --el-header-height: 50px;
  }
}

html, body {
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--el-bg-color);
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
  height: 100dvh;
}

.el-main {
  --el-main-padding: unset;
  height: calc(100dvh - var(--el-header-height));
}
</style>
