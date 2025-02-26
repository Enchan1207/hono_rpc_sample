<script setup lang="ts">
import { BIconArrowClockwise } from 'bootstrap-icons-vue'
import { computed } from 'vue'

import type { TaskListItem } from '@/entities/task'

import TaskListRow from './TaskListRow.vue'

const props = defineProps<{
  tasks: TaskListItem[]
  hasNext: boolean
  isLoading: boolean
  error: Error | undefined
}>()
const emits = defineEmits<{
  (operation: 'remove', id: TaskListItem['id']): void
  (operation: 'next' | 'reload'): void
}>()

const isScrollDisabled = computed(() => {
  return props.isLoading || !props.hasNext || props.error !== undefined
})

</script>

<template>
  <ul
    v-infinite-scroll="()=>emits('next')"
    :infinite-scroll-disabled="isScrollDisabled"
    class="task-list"
  >
    <li
      v-for="task in props.tasks"
      :key="task.id"
    >
      <TaskListRow
        :item="task"
        @remove="emits('remove', task.id)"
      />
    </li>

    <li
      v-if="isLoading"
      v-loading="isLoading"
      class="task-loading-indicator"
    />

    <li
      v-if="!isLoading && !hasNext"
      class="last-element-info"
    >
      <el-text
        size="small"
      >
        最後のアイテムです
      </el-text>
    </li>

    <li
      v-if="error"
      class="error-info"
    >
      <div>読み込みに失敗しました: {{ error.message }}</div>
      <el-button
        :icon="BIconArrowClockwise"
        @click="emits('reload')"
      >
        再試行
      </el-button>
    </li>
  </ul>
</template>

<style>
.task-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.task-list > li {
  margin-bottom: 10px;
}

li.last-element-info {
  padding: 5px 0;
  text-align: center;
  user-select: none;
}

li.error-info {
  text-align: center;
}

li.error-info>*:not(:last-child){
  margin-bottom: 10px;
}

.task-loading-indicator {
  height: 60px;
}

.task-loading-indicator .el-loading-mask {
  background-color: transparent;
}
</style>
