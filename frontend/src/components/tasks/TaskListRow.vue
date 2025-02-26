<script setup lang="ts">
import { BIconTrashFill } from 'bootstrap-icons-vue'

import type { TaskListItem } from '@/entities/task'

import DueTag from './DueTag.vue'
import PriorityTag from './PriorityTag.vue'

defineProps<{ item: TaskListItem }>()
const emits = defineEmits(['remove'])
</script>

<template>
  <el-card
    shadow="hover"
    class="task-card"
    body-class="task-card-body"
  >
    <router-link
      :to="`/tasks/${item.id}`"
      class="task-card-link"
    />
    <div>
      <p class="task-card-title">
        {{ item.title }}
      </p>
      <div class="task-card-infos">
        <DueTag :due="item.due" />
        <PriorityTag :priority="item.priority" />
      </div>
    </div>

    <div class="task-card-menu">
      <el-button
        class="remove-button"
        type="danger"
        :icon="BIconTrashFill"
        circle
        size="small"
        @click.stop="emits('remove')"
      />
    </div>
  </el-card>
</template>

<style>
.task-card {
  user-select: none;
}

.task-card-body {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.task-card-link {
  position: absolute;
  inset: 0px;
}

.task-card-title {
  margin: 0 0 10px 0;
}

.task-card-infos>*:not(:last-child) {
  margin-right: 10px;
}

.task-card-menu {
  display: flex;
  justify-content: right;
  align-items: center;
}

.remove-button {
  pointer-events: none;
  opacity: 0;
  transition: opacity .2s ease-in-out;
}

@media (hover: hover){
  .task-card:hover .remove-button {
    pointer-events: all;
    opacity: 1;
  }
}

.task-card .over{
  color: red;
  font-weight: bold;
}
</style>
