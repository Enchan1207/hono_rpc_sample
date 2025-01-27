<template>
  <template v-if="isLoading">
    <div>now loading...</div>
  </template>

  <template v-if="error">
    <div>some error occured: {{ error.message }}</div>
  </template>

  <template v-if="task">
    <TaskDetail
      :task="task"
      @commit="update"
    />
  </template>

  <button @click="router.back()">
    back
  </button>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useTaskData } from '@/composables/useTaskData'
import TaskDetail from '@/components/TaskDetail.vue'

const route = useRoute<'/tasks/[id]'>()
const router = useRouter()

const {
  task, isLoading, error, update,
} = useTaskData(route.params.id)
</script>
