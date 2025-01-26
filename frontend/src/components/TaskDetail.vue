<template>
  <h2>{{ props.task.title }}</h2>
  <ul>
    <li>Priority: {{ props.task.priority }}</li>
    <li>Description: {{ props.task.description }}</li>
    <li :class="limitElementClass">
      Limit: {{ props.task.limit.fromNow() }}
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
