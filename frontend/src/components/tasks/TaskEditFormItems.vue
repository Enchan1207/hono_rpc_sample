<script setup lang="ts">
import { computed } from 'vue'
import PriorityTag from './PriorityTag.vue'
import type { TaskPriority } from '@/entities/task'
import dayjs from '@/logic/dayjs'

const props = defineProps<{ loading: boolean }>()

const title = defineModel<string>('title', { required: true })
const due = defineModel<dayjs.Dayjs | undefined>('due', { required: true })
const priority = defineModel<TaskPriority>('priority', { required: true })
const description = defineModel<string>('description', { required: true })

const internalDue = computed({
  get: () => due.value?.toDate(),
  set: value => due.value = value !== undefined ? dayjs.tz(value) : undefined,
})

const priorityOptions: Record<TaskPriority, string> = {
  low: '低',
  middle: '中',
  high: '高',
}
</script>

<template>
  <div v-loading="props.loading">
    <el-form-item
      label="タイトル"
      prop="title"
      :rules="[{
        required: true, message: 'タイトルを入力してください', trigger: ['blur', 'change']
      }]"
    >
      <el-input v-model="title" />
    </el-form-item>

    <el-form-item
      label="期日"
      prop="due"
      :rules="[{
        required: true, message: '期日を設定してください', trigger: ['blur', 'change']
      }]"
    >
      <el-date-picker
        v-model="internalDue"
        type="date"
        placeholder="期日を選択"
        :editable="false"
        :value-on-clear="()=>undefined"
      />
    </el-form-item>

    <el-form-item
      label="優先度"
      prop="priority"
      :rules="[{
        required: false
      }]"
    >
      <el-select v-model="priority">
        <el-option
          v-for="[priorityKey, label] in Object.entries(priorityOptions)"
          :key="priorityKey"
          :label="label"
          :value="priorityKey"
        >
          <PriorityTag :priority="(priorityKey as TaskPriority)" />
        </el-option>
      </el-select>
    </el-form-item>

    <el-form-item
      label="詳細"
      prop="description"
      :rules="[{
        required: false
      }]"
    >
      <el-input
        v-model="description"
        type="textarea"
      />
    </el-form-item>
  </div>
</template>
