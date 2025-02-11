<script setup lang="ts">
import {
  computed, ref, watch,
} from 'vue'
import type { WritableComputedRef } from 'vue'
import dayjs from '@/logic/dayjs'
import type { Task, TaskPriority } from '@/entities/task'

// idだけはオプショナルにする
export type TaskDetailProps = Omit<Task, 'id'> & { id?: Task['id'] }

const props = defineProps<{ task: TaskDetailProps }>()
const emits = defineEmits<{
  (e:
  'commit',
    formData: TaskDetailProps): void
}>()

const formData = ref<TaskDetailProps>(props.task)
const internalDue: WritableComputedRef<string> = computed({
  get: () => formData.value.due.format('YYYY-MM-DD HH:mm:ss'),
  set: value => formData.value.due = dayjs.tz(value),
})

// 親から渡された値に変更があればそれを反映する
watch(props, ({ task }) => {
  formData.value = task
})

const onCommit = () => {
  emits('commit', formData.value)
}

const priorityOptions: Record<TaskPriority, string> = {
  high: '高',
  middle: '中',
  low: '低',
}

const commitButtonString = computed(() => {
  if (formData.value.id !== undefined) {
    return '更新'
  }
  else {
    return '登録'
  }
})
</script>

<template>
  <el-form
    label-position="left"
    label-width="auto"
    :model="formData"
  >
    <el-form-item label="タイトル">
      <el-input v-model="formData.title" />
    </el-form-item>

    <el-form-item label="優先度">
      <el-select v-model="formData.priority">
        <el-option
          v-for="[sortKey, label] in Object.entries(priorityOptions)"
          :key="sortKey"
          :label="label"
          :value="sortKey"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="詳細">
      <el-input
        v-model="formData.description"
        type="textarea"
      />
    </el-form-item>

    <el-form-item label="期日">
      <el-date-picker
        v-model="internalDue"
        type="datetime"
        placeholder="Select date and time"
        :editable="false"
      />
    </el-form-item>

    <el-form-item>
      <el-button
        type="primary"
        @click="onCommit"
      >
        {{ commitButtonString }}
      </el-button>
    </el-form-item>
  </el-form>
</template>
