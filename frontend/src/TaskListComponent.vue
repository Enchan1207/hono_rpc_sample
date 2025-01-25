<template>
  <h2>Registered tasks</h2>
  <ul>
    <li
      v-for="task in props.tasks"
      :key="task.id"
    >
      <ul>
        <li>title: {{ task.title }}</li>
        <li>priority: {{ task.priority }}</li>
        <li>due: {{ task.limit.toISOString() }}</li>
        <li>
          <button @click="emits('showDetail', task.id)">
            show details
          </button>
        </li>
        <li>
          <button @click="emits('delete', task.id)">
            delete
          </button>
        </li>
      </ul>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { TaskListItem } from '@backend/repository/taskRepository'

const props = defineProps<{ tasks: TaskListItem[] }>()
const emits = defineEmits<{
  (
    operation: 'showDetail' | 'delete',
    id: TaskListItem['id']
  ): void
}>()

</script>
