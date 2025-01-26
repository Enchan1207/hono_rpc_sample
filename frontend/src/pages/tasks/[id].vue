<template>
  <template v-if="isLoading">
    <div>now loading...</div>
  </template>

  <template v-if="error">
    <div>some error occured: {{ error.message }}</div>
  </template>

  <!-- TODO: ここをTaskCardとか切り出す -->
  <template v-if="task">
    <h2>Stored task: {{ task.title }}</h2>
    <ul>
      <li>Priority: {{ task.priority }}</li>
      <li>Description: {{ task.description }}</li>
      <li>Limit: {{ task.limit.format() }}</li>
    </ul>
  </template>

  <button @click="router.back()">
    back
  </button>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useTaskData } from '@/composables/useTaskData'

const route = useRoute('/tasks/[id]')
const router = useRouter()

const {
  task, isLoading, error,
} = useTaskData(route.params.id)

</script>
