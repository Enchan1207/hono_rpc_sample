<template>
  <h2>Register new task</h2>

  <form @submit.prevent="emits('submit', newTask)">
    <label for="title">タスク名</label>
    <input
      id="title"
      v-model="newTask.title"
      type="text"
    >

    <label for="priority">優先度</label>
    <select
      id="priority"
      v-model="newTask.priority"
    >
      <option value="high">
        高
      </option>
      <option
        value="middle"
        selected
      >
        中
      </option>
      <option value="low">
        低
      </option>
    </select>

    <label for="description">説明</label>
    <input
      id="description"
      v-model="newTask.description"
      type="text"
    >

    <label for="limit">期日</label>
    <input
      id="limit"
      v-model="limitDateString"
      type="date"
    >

    <button type="submit">
      追加
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Task } from '@/entities/task'
import dayjs from '@/logic/dayjs'

const emits = defineEmits<{ (e: 'submit', task: Omit<Task, 'id'>): void }>()

const newTask = ref<Omit<Task, 'id'>>({
  title: '',
  priority: 'middle',
  limit: dayjs(),
  description: '',
})

const limitDateString = ref<string>('')
watch(limitDateString, () => {
  newTask.value.limit = dayjs(limitDateString.value)
})

</script>
