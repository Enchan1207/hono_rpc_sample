<script setup lang="ts">
import {
  BIconHouseFill, BIconPencilSquare, BIconSunFill, BIconMoonFill,
} from 'bootstrap-icons-vue'
import {
  breakpointsElement, useBreakpoints, useDark, useToggle,
} from '@vueuse/core'
import { useRouter } from 'vue-router'

const breakpoints = useBreakpoints(breakpointsElement)
const isSmartphone = breakpoints.smaller('sm')

const router = useRouter()

const emits = defineEmits(['select'])

const isDark = useDark()
const toggleDark = useToggle(isDark)

const onClickNew = () => {
  emits('select')
  router.push('/tasks/new')
}
</script>

<template>
  <div class="sidebar-container">
    <div
      v-if="!isSmartphone"
      class="add-button-container sidebar-button-container"
    >
      <el-button
        type="primary"
        :icon="BIconPencilSquare"
        size="large"
        round
        @click="onClickNew"
      >
        追加
      </el-button>
    </div>

    <el-menu
      :router="true"
      @select="emits('select')"
    >
      <el-menu-item index="/tasks">
        <el-icon><b-icon-house-fill /></el-icon>
        <span>ホーム</span>
      </el-menu-item>
    </el-menu>

    <div class="appearance-switch-container sidebar-button-container">
      <el-text>
        外観:
      </el-text>
      <el-switch
        :model-value="isDark"
        :active-icon="BIconMoonFill"
        :inactive-icon="BIconSunFill"
        class="color-mode-switch"
        @change="toggleDark()"
      />
    </div>
  </div>
</template>

<style>
.sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-container .el-menu {
  flex: 1;
}

.el-menu-item {
  user-select: none;
}

.sidebar-container .sidebar-button-container {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  height: 40px;
  user-select: none;
}

.sidebar-container .appearance-switch-container {
  gap: 10px
}

.sidebar-container .add-button-container .el-button {
  height: 40px;
  justify-content: left;
}
</style>
