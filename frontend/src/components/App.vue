<template>
  <h2>Hono RPC sample</h2>

  <TaskRegisterForm @submit="onSubmit" />

  <hr>

  <TaskListComponent
    :tasks="tasks"
    @show-detail="onClickDetail"
    @delete="onClickDelete"
  />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import TaskListComponent from './TaskListComponent.vue'
import TaskRegisterForm from './TaskRegisterForm.vue'
import type { Task, TaskListItem } from '@/entities/task'
import {
  addTask, deleteTask, getTask, listTask,
} from '@/repositories/taskRepository'

const tasks = ref<TaskListItem[]>([])

onMounted(async () => {
  await loadItem()
})

const loadItem = async () => {
  tasks.value = await listTask({})
}

// MARK: - Event handlers

const onClickDetail = async (id: TaskListItem['id']) => {
  const task = await getTask(id)
  alert(task?.description ?? 'Failed to fetch')
}

const onClickDelete = async (id: TaskListItem['id']) => {
  const deleted = await deleteTask(id)
  if (deleted === undefined) {
    alert('Failed to delete')
    return
  }

  await loadItem()
}

const onSubmit = async (task: Omit<Task, 'id'>) => {
  await addTask(task)
  await loadItem()
}

</script>
