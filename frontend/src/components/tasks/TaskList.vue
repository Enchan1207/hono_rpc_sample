<script setup lang="ts">
import TaskListRow from './TaskListRow.vue'
import type { TaskListItem } from '@/entities/task'

const props = defineProps<{
  tasks: TaskListItem[]
  hasNext: boolean
  isLoading: boolean
}>()
const emits = defineEmits<{
  (
    operation: 'remove',
    id: TaskListItem['id']
  ): void
  (
    operation: 'next',
  ): void
}>()
</script>

<template>
  <ul
    v-infinite-scroll="()=>emits('next')"
    :infinite-scroll-disabled="isLoading || !hasNext"
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
      v-if="!hasNext"
      class="last-element-info"
    >
      <el-text
        size="small"
      >
        最後のアイテムです
      </el-text>
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
}
</style>
