<template>
  <el-row
    justify="end"
    class="task-list-header"
  >
    <el-col :span="4">
      <el-select v-model="key">
        <el-option
          v-for="[sortKey, label] in Object.entries(sortOpts)"
          :key="sortKey"
          :label="label"
          :value="sortKey"
        />
      </el-select>
    </el-col>

    <el-col :span="2">
      <el-button
        :icon="order==='asc' ? SortUp : SortDown"
        @click="onClickOrder"
      >
        {{ orderLabel[order] }}
      </el-button>
    </el-col>
  </el-row>

  <el-row justify="center">
    <el-col :span="16">
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

<script setup lang="ts">
import { SortDown, SortUp } from '@element-plus/icons-vue'
import { ref } from 'vue'
import TaskList from '@/components/tasks/TaskList.vue'
import { useTaskList } from '@/composables/useTaskList'

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

<style>
.task-list-header {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 10px;
  background-color: var(--el-fill-color-blank);
}

.task-list-header .el-col:not(:last-child){
  padding-right: 10px;
}
</style>
