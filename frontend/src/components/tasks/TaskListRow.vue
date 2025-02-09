<script setup lang="ts">
import { DeleteFilled } from '@element-plus/icons-vue'
import type { TaskListItem } from '@/entities/task'
import dayjs from '@/logic/dayjs'

const props = defineProps<{ item: TaskListItem }>()
const emits = defineEmits(['detail', 'remove'])
</script>

<template>
  <el-card>
    <el-row>
      <el-col :span="22">
        <el-button
          type="primary"
          link
          @click="emits('detail')"
        >
          {{ props.item.title }}
        </el-button>
        <div>
          priority: {{ props.item.priority }}
        </div>
        <div :class="props.item.due.isBefore(dayjs()) ? 'over':''">
          due:{{ props.item.due.fromNow() }}
        </div>
      </el-col>

      <el-col :span="2">
        <el-button
          class="remove-button"
          type="danger"
          :icon="DeleteFilled"
          circle
          size="small"
          @click="emits('remove')"
        />
      </el-col>
    </el-row>
  </el-card>
</template>

<style>
.el-card {
  user-select: none;
}

.remove-button {
  pointer-events: none;
  opacity: 0;
  transition: opacity .1s ease-in-out;
}

.el-card:hover .remove-button {
  pointer-events: all;
  opacity: 1;
}

.el-card .over{
  color: red;
  font-weight: bold;
}
</style>
