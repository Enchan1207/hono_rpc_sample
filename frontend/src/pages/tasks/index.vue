<script setup lang="ts">
import {
  SortDown, SortUp, Edit,
} from '@element-plus/icons-vue'
import { ref } from 'vue'
import { breakpointsElement, useBreakpoints } from '@vueuse/core'
import TaskList from '@/components/tasks/TaskList.vue'
import { useTaskList } from '@/composables/useTaskList'
import { router } from '@/routes'

const breakpoints = useBreakpoints(breakpointsElement)
const isSmartphone = breakpoints.isSmaller('sm')

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
  remove,
} = useTaskList({
  key,
  order,
  itemPerPage,
})

// MARK: - Event handlers

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
    :icon="Edit"
    @click="router.push('/tasks/new')"
  />
  <el-row
    justify="end"
    class="task-list-header"
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
      :icon="order==='asc' ? SortUp : SortDown"
      @click="onClickOrder"
    >
      {{ orderLabel[order] }}
    </el-button>
  </el-row>

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
        :has-next="hasNext"
        :is-loading="isLoading"
        @remove="remove"
        @next="next"
      />
    </el-col>
  </el-row>
</template>

<style>
.task-list-header {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 10px;
  background-color: var(--el-fill-color-blank);
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
