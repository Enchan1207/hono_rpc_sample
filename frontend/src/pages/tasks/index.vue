<template>
  <h2>Registered tasks</h2>
  <hr>
  <div>
    <button @click="onClickOrder">
      order: {{ order }}
    </button>

    <button @click="onClickKey">
      key: {{ key }}
    </button>
  </div>

  <template v-if="isLoading">
    <div>now loading...</div>
  </template>

  <template v-if="error">
    <div>some error occured: {{ error.message }}</div>
  </template>

  <template v-if="tasks">
    <TaskList
      :tasks="tasks"
      @detail="onClickDetail"
      @remove="remove"
    />
  </template>
  <hr>
  <button @click="onClickAdd">
    Add new task
  </button>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import type { TaskListItem } from '@/entities/task'
import TaskList from '@/components/TaskList.vue'
import { useTaskList } from '@/composables/useTaskList'

const router = useRouter()

const key = ref<'id' | 'limit' | 'priority'>('id')
const order = ref <'asc' | 'desc'>('desc')

const {
  tasks,
  isLoading,
  error,
  next: _,
  remove,
} = useTaskList({
  key,
  order,
})

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

const onClickOrder = () => {
  const currentOrder = order.value
  order.value = currentOrder === 'asc' ? 'desc' : 'asc'
}

const onClickKey = () => {
  switch (key.value) {
    case 'id':
      key.value = 'limit'
      break

    case 'limit':
      key.value = 'priority'
      break

    case 'priority':
      key.value = 'id'
      break
  }
}
</script>
