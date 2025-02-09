<template>
  <div>
    <el-select v-model="key">
      <el-option
        v-for="[sortKey, label] in Object.entries(sortOpts)"
        :key="sortKey"
        :label="label"
        :value="sortKey"
      />
    </el-select>

    <el-button
      :icon="order==='asc' ? SortUp : SortDown"
      @click="onClickOrder"
    >
      {{ orderLabel[order] }}
    </el-button>

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
</template>

<script setup lang="ts">
import { SortDown, SortUp } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import type { TaskListItem } from '@/entities/task'
import TaskList from '@/components/tasks/TaskList.vue'
import { useTaskList } from '@/composables/useTaskList'

const router = useRouter()

// 並べ替え項目
type SortKeys = 'id' | 'due' | 'priority'
const sortOpts: Record<SortKeys, string> = {
  id: '作成日',
  due: '期日',
  priority: '優先度',
}
const key = ref<SortKeys>('id')

// 並べ替え順序
type Orders = 'asc' | 'desc'
const orderLabel: Record<Orders, string> = {
  asc: '昇順',
  desc: '降順',
}
const order = ref <Orders>('desc')

/** @deprecated 無限スクロール実装するならUIとして項目用意する必要ないはず */
const itemPerPage = ref(20)

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
</script>
