<script setup lang="ts">
import { ref } from 'vue'
import {
  breakpointsElement, useBreakpoints, useTitle,
} from '@vueuse/core'
import {
  BIconPencilSquare, BIconSortDown, BIconSortUp,
} from 'bootstrap-icons-vue'
import TaskList from '@/components/tasks/TaskList.vue'
import { useTaskList } from '@/composables/useTaskList'
import { router } from '@/routes'
import type { TaskListItem } from '@/entities/task'
import { useTaskOperation } from '@/composables/useTaskOperation'

const breakpoints = useBreakpoints(breakpointsElement)
const isSmartphone = breakpoints.smaller('sm')

useTitle('タスク一覧')

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
  next,
  hasNext,
  error,
} = useTaskList({
  key,
  order,
  itemPerPage,
})

const { remove, isOperating } = useTaskOperation()

// MARK: - Event handlers

const onClickRemove = async (id: TaskListItem['id']) => {
  if (isOperating.value) {
    ElMessage.warning('他のアイテムを削除中です。')
    return
  }
  const result = await remove(id)
  result.match((removed) => {
    // ローカルのtasksを全部洗い直すのはやばいので、filterで消す
    tasks.value = tasks.value.filter(task => task.id !== removed.id)
    ElMessage(`タスクアイテム 「${removed.title}」を削除しました。`)
  }, (error) => {
    ElMessage.error(`削除に失敗しました: ${error.message}`)
  })
}

const onClickOrder = () => {
  const currentOrder = order.value
  order.value = currentOrder === 'asc' ? 'desc' : 'asc'
}
</script>

<template>
  <el-button
    v-if="isSmartphone"
    type="primary"
    class="add-btn"
    :icon="BIconPencilSquare"
    @click="router.push('/tasks/new')"
  />

  <div class="task-list-header">
    <el-row>
      <el-col>
        <h2>タスク一覧</h2>
      </el-col>
    </el-row>

    <el-row
      justify="end"
      class="task-list-sort-container"
    >
      <el-select
        v-model="key"
        class="sort-key-selector"
        :disabled="isLoading"
      >
        <el-option
          v-for="[sortKey, label] in Object.entries(sortOpts)"
          :key="sortKey"
          :label="label"
          :value="sortKey"
        />
      </el-select>

      <el-button
        :disabled="isLoading"
        :icon="order==='asc' ? BIconSortUp : BIconSortDown"
        @click="onClickOrder"
      >
        {{ orderLabel[order] }}
      </el-button>
    </el-row>
  </div>

  <el-row justify="center">
    <el-col
      :xs="22"
      :sm="20"
      :md="18"
      :lg="14"
      :xl="10"
    >
      <TaskList
        :tasks="tasks"
        :error="error"
        :has-next="hasNext"
        :is-loading="isLoading"
        @remove="onClickRemove"
        @next="next"
        @reload="next"
      />
    </el-col>
  </el-row>
</template>

<style scoped>
h2{
  margin: 0;
}

.el-row:not(:last-child){
  margin-bottom: 15px;
}

.task-list-header {
  position: sticky;
  top: calc(-1 * var(--el-main-padding));
  z-index: 10;
  padding: 10px;
  background-color: var(--el-bg-color);
}

.task-list-sort-container {
  gap: 5px 10px;
}

.sort-key-selector {
  max-width: 120px;
}

.add-btn {
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  right: 30px;
  bottom: 40px;
  z-index: 20;
}
</style>
