<template>
  <h2>Add new task</h2>
  <TaskRegisterForm @submit="onSubmit" />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import TaskRegisterForm from '@/components/TaskRegisterForm.vue'
import { addTask } from '@/repositories/taskRepository'
import type { Task } from '@/entities/task'

const router = useRouter()

const onSubmit = async (task: Omit<Task, 'id'>) => {
  await addTask(task)
  router.back()
}
</script>
