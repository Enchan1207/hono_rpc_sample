<script setup lang="ts">
import { Edit } from '@element-plus/icons-vue'
import { breakpointsElement, useBreakpoints } from '@vueuse/core'
import { useRouter } from 'vue-router'

const breakpoints = useBreakpoints(breakpointsElement)
const isSmartphone = breakpoints.isSmaller('sm')

const router = useRouter()

const emits = defineEmits(['select'])

const onClickNew = () => {
  emits('select')
  router.push('/tasks/new')
}
</script>

<template>
  <div
    v-if="!isSmartphone"
    class="add-button-container"
  >
    <el-button
      type="primary"
      :icon="Edit"
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
      <el-icon><el-icon-home-filled /></el-icon>
      <span>ホーム</span>
    </el-menu-item>
  </el-menu>
</template>

<style>
.el-menu-item {
  user-select: none;
}

.add-button-container{
  padding: 10px 20px;
}

.add-button-container .el-button {
  height: 40px;
  justify-content: left;
}
</style>
