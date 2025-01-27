<template>
  <form @submit.prevent="onCommit">
    <ul>
      <li>
        <label for="title">タイトル</label>
        <input
          id="title"
          v-model="formData.title"
          type="text"
        >
      </li>
      <li>
        <label for="priority">優先度</label>
        <select
          id="priority"
          v-model="formData.priority"
        >
          <option value="high">
            高
          </option>
          <option value="middle">
            中
          </option>
          <option value="low">
            低
          </option>
        </select>
      </li>

      <li>
        <label for="description">詳細</label>
        <textarea
          id="description"
          v-model="formData.description"
          cols="30"
          rows="10"
        />
      </li>

      <li>
        <label for="limit">期日</label>
        <input
          id="limit"
          v-model="internalLimit"
          type="date"
        >
      </li>
      <li>
        <button type="submit">
          {{ commitButtonString }}
        </button>
      </li>
    </ul>
  </form>
</template>

<script setup lang="ts">
import {
  computed, ref, watch,
} from 'vue'
import type { WritableComputedRef } from 'vue'
import dayjs from '@/logic/dayjs'
import type { Task } from '@/entities/task'

// idだけはオプショナルにする
export type TaskDetailProps = Omit<Task, 'id'> & { id?: Task['id'] }

const props = defineProps<{ task: TaskDetailProps }>()
const emits = defineEmits<{
  (e:
  'commit',
    formData: TaskDetailProps): void
}>()

const formData = ref<TaskDetailProps>(props.task)

const internalLimit: WritableComputedRef<string> = computed({
  get: () => formData.value.limit.format('YYYY-MM-DD'),
  set: value => formData.value.limit = dayjs.tz(value),
})

// 親から渡された値に変更があればそれを反映する
watch(props, ({ task }) => {
  formData.value = task
})

const onCommit = () => {
  emits('commit', formData.value)
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
