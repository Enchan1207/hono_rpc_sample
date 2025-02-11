<script setup lang="ts">
import { computed } from 'vue'
import dayjs from '@/logic/dayjs'

const props = defineProps<{ due: dayjs.Dayjs }>()

const isOver = computed(() => {
  return props.due.isBefore(dayjs())
})
</script>

<template>
  <el-tag
    :type="isOver ? 'danger': 'info'"
    round
  >
    {{ due.fromNow() }}
  </el-tag>
</template>
