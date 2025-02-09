<script setup lang="ts">
import { DeleteFilled } from '@element-plus/icons-vue'
import dayjs from '@/logic/dayjs'
import type { TaskListItem } from '@/entities/task'

const props = defineProps<{
  tasks: TaskListItem[]
  hasNext: boolean
  isLoading: boolean
}>()
const emits = defineEmits<{
  (
    operation: 'detail' | 'remove',
    id: TaskListItem['id']
  ): void
  (
    operation: 'next',
  ): void
}>()
</script>

<template>
  <el-table
    v-loading="isLoading"
    v-infinite-scroll="()=>emits('next')"
    :v-infinite-scroll-distance="10"
    :infinite-scroll-disabled="isLoading || !hasNext"
    :data="props.tasks"
    :height="200"
  >
    <el-table-column
      prop="title"
      label="タイトル"
    >
      <template #default="{row: task}">
        <div class="title-cell">
          <el-button
            link
            type="primary"
            @click="emits('detail', task.id)"
          >
            {{ task.title }}
          </el-button>
          <el-button
            class="remove-button"
            type="danger"
            :icon="DeleteFilled"
            size="small"
            circle
            @click.stop="emits('remove', task.id)"
          />
        </div>
      </template>
    </el-table-column>
    <el-table-column
      prop="priority"
      label="優先度"
    />
    <el-table-column
      prop="due"
      label="期日"
    >
      <template #default="{row: task}">
        <span :class="task.due.isBefore(dayjs()) ? 'over':''">
          {{ task.due.fromNow() }}
        </span>
      </template>
    </el-table-column>
  </el-table>
</template>

<style>
.el-table__row {
  user-select: none;
}

.remove-button {
  opacity: 0;
  pointer-events: none;
  transition: all ease-in-out .1s;
}

.el-table__row:hover .remove-button{
  opacity: 1;
  pointer-events: all;
}

.el-table__row .over{
  color: red;
  font-weight: bold;
}

.title-cell {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
