<template>
  <div class="row">
    <span>{{ props.item.title }}</span>
    <span>Priority: {{ props.item.priority }}</span>
    <span :class="dueElementClass">
      Due: {{ props.item.due.fromNow() }}
    </span>
    <span>
      <button @click="emits('detail')">
        Show details
      </button>
    </span>
    <span>
      <button @click="emits('remove')">
        Delete
      </button>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TaskListItem } from '@/entities/task'
import dayjs from '@/logic/dayjs'

const props = defineProps<{ item: TaskListItem }>()

const emits = defineEmits(['detail', 'remove'])

const dueElementClass = computed(() => {
  const isOver = props.item.due.isBefore(dayjs())
  return isOver ? 'over' : ''
})

</script>

<style>
.over{
    color: red;
    font-weight: bold;
}
.row{
  display: flex;
}
.row span{
  margin: 0 10px;
}
</style>
