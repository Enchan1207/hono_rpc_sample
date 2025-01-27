<template>
  <ul>
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

<script setup lang="ts">
import TaskListRow from './TaskListRow.vue'
import type { TaskListItem } from '@/entities/task'

const props = defineProps<{ tasks: TaskListItem[] }>()
const emits = defineEmits<{
  (
    operation: 'detail' | 'remove',
    id: TaskListItem['id']
  ): void
}>()
</script>
