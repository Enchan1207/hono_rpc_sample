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
import type { TaskListItem } from '@backend/repository/taskRepository'
import type { Task } from '@backend/resource/task'
import { client } from './client'
import TaskListComponent from './TaskListComponent.vue'
import TaskRegisterForm from './TaskRegisterForm.vue'

const tasks = ref<TaskListItem[]>([])

onMounted(async () => {
  await loadItem()
})

const loadItem = async () => {
  // TODO: 双方プリミティブ型でやりとりした方がよいのでは?
  const tasksData = await (await client.task.$get({ query: {} })).json()
  tasks.value = tasksData.map(task => ({
    ...task,
    limit: new Date(task.limit),
  }))
}

// MARK: - Event handlers

const onClickDetail = async (id: TaskListItem['id']) => {
  const response = await client.task[':id'].$get({ param: { id } })
  if (!response.ok) {
    alert('Failed to get details of task')
    return
  }
  const task = await response.json()
  alert(task.description)
}

const onClickDelete = async (id: TaskListItem['id']) => {
  const response = await client.task[':id'].$delete({ param: { id } })
  if (!response.ok) {
    alert('Failed to delete task')
    return
  }

  await loadItem()
}

const onSubmit = async (task: Omit<Task, 'id'>) => {
  const response = await client.task.$post({ json: task })
  if (!response.ok) {
    alert('Failed to register new task')
    return
  }

  await loadItem()
}

</script>
