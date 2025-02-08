<template>
  <div>
    <button @click="onClickOrder">
      order: {{ order }}
    </button>

    <button @click="onClickKey">
      key: {{ key }}
    </button>

    <label for="item_per_page">Items per page:</label>
    <select
      id="item_per_page"
      v-model="itemPerPage"
    >
      <template
        v-for="count in itemCountSelections"
        :key="count"
      >
        <option
          :value="count"
        >
          {{ count }}
        </option>
      </template>
    </select>
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
    <button
      v-if="hasNext"
      :disabled="isLoading"
      @click="next"
    >
      load more
    </button>
    <template v-else>
      -- last item --
    </template>
  </template>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import type { Ref } from 'vue'
import type { TaskListItem } from '@/entities/task'
import TaskList from '@/components/tasks/TaskList.vue'
import { useTaskList } from '@/composables/useTaskList'

const router = useRouter()

const key = ref<'id' | 'due' | 'priority'>('id')
const order = ref <'asc' | 'desc'>('desc')

const itemCountSelections = [5, 10, 20, 50] as const
const itemPerPage: Ref<(typeof itemCountSelections)[number]> = ref(20)

const {
  tasks,
  isLoading,
  error,
  next,
  hasNext,
  remove,
} = useTaskList({
  key,
  order,
  itemPerPage,
})

// MARK: - Event handlers

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
      key.value = 'due'
      break

    case 'due':
      key.value = 'priority'
      break

    case 'priority':
      key.value = 'id'
      break
  }
}
</script>
