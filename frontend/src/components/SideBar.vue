<script setup lang="ts">
import { Edit } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="add-button-container">
    <el-button
      type="primary"
      :icon="Edit"
      size="large"
      round
      @click="router.push('/tasks/new')"
    >
      追加
    </el-button>
  </div>
  <el-menu :router="true">
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
