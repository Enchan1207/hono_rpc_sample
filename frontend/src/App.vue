<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'
import {
  breakpointsElement, useBreakpoints, useDark,
} from '@vueuse/core'
import { BIconList } from 'bootstrap-icons-vue'
import { ref, watch } from 'vue'

import Sidebar from '@/components/SideBar.vue'

useDark()

const {
  loginWithRedirect, isAuthenticated, logout,
} = useAuth0()

const breakpoints = useBreakpoints(breakpointsElement)
const isSmartphone = breakpoints.smaller('sm')
watch(isSmartphone, (newValue, prevValue) => {
  // スマホビューではサイドバーはドロワーになるため、いったん閉じる
  const isTransitionToSmartphone = prevValue === false && newValue === true
  isSidebarVisible.value = !isTransitionToSmartphone
})

const isSidebarVisible = ref(!isSmartphone.value)

const onClickLogout = async () => {
  await logout({ logoutParams: { returnTo: window.location.origin } })
}
</script>

<template>
  <el-container class="root-container">
    <el-header>
      <el-row>
        <span class="sidebar-button-wrapper">
          <el-button
            :icon="BIconList"
            @click="isSidebarVisible = !isSidebarVisible"
          />
        </span>
        <h1>Tasks</h1>
        <el-button
          v-if="!isAuthenticated"
          @click="loginWithRedirect()"
        >
          Login
        </el-button>
        <el-button
          v-else
          @click="onClickLogout"
        >
          Logout
        </el-button>
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
