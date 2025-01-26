<template>
  <h2>Registered tasks</h2>
  <hr>
  <TaskListComponent
    :tasks="tasks"
    @show-detail="onClickDetail"
    @delete="onClickDelete"
  />
  <hr>
  <button @click="onClickAdd">
    Add new task
  </button>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { TaskListItem } from '@/entities/task'
import { deleteTask, listTask } from '@/repositories/taskRepository'
import TaskListComponent from '@/components/TaskListComponent.vue'

const tasks = ref<TaskListItem[]>([])
const router = useRouter()

onMounted(async () => {
  await loadItem()
})

const loadItem = async () => {
  tasks.value = await listTask({})
}

// MARK: - Event handlers

const onClickAdd = () => {
  router.push('/tasks/new')
}

const onClickDetail = (id: TaskListItem['id']) => {
  router.push({
    name: '/tasks/[id]',
    params: { id },
  })
}

const onClickDelete = async (id: TaskListItem['id']) => {
  const deleted = await deleteTask(id)
  if (deleted === undefined) {
    alert('Failed to delete')
    return
  }

  await loadItem()
}

</script>
