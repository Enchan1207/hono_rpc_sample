<template>
  <h2>{{ task.title }}</h2>
  <ul>
    <li>Priority: {{ task.priority }}</li>
    <li>Description: {{ task.description }}</li>
    <li :class="limitElementClass">
      Limit: {{ task.limit.fromNow() }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/entities/task'
import dayjs from '@/logic/dayjs'

const props = defineProps<{ task: Task }>()
const limitElementClass = computed(() => {
  const isOver = props.task.limit.isBefore(dayjs())
  return isOver ? 'over' : ''
})
</script>

<style>
.over{
    color: red;
    font-weight: bold;
}
</style>
