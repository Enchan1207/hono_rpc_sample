<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { addTask } from '@/repositories/taskRepository'
import type { Task } from '@/entities/task'
import TaskDetail from '@/components/tasks/TaskDetail.vue'
import dayjs from '@/logic/dayjs'

const router = useRouter()

const task = ref<Omit<Task, 'id'>>({
  title: '',
  priority: 'middle',
  due: dayjs(),
  description: '',
})

const onSubmit = async (task: Omit<Task, 'id'>) => {
  await addTask(task)
  router.back()
}
</script>

<template>
  <h2>Add new task</h2>
  <TaskDetail
    :task="task"
    @commit="onSubmit"
  />
</template>
