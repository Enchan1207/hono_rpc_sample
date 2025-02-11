<script setup lang="ts">
import type { TagProps } from 'element-plus'
import type { TaskPriority } from '@/entities/task'

defineProps<{ priority: TaskPriority }>()

const typeMap: Record<TaskPriority, TagProps['type']> = {
  low: 'success',
  middle: 'warning',
  high: 'danger',
}

const labelMap: Record<TaskPriority, string> = {
  low: '低',
  middle: '中',
  high: '高',
}
</script>

<template>
  <el-tag
    :type="typeMap[priority]"
    round
  >
    優先度: {{ labelMap[priority] }}
  </el-tag>
</template>
