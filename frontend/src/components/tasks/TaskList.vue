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
    operation: 'detail' | 'remove',
    id: TaskListItem['id']
  ): void
  (
    operation: 'next',
  ): void
}>()
</script>

<template>
  <ul class="task-list">
    <li
      v-for="task in props.tasks"
      :key="task.id"
    >
      <TaskListRow
        :item="task"
        @detail="emits('detail', task.id)"
        @remove="emits('remove', task.id)"
      />
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
</style>
