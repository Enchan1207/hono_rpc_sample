<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { BIconChevronLeft } from 'bootstrap-icons-vue'
import { useTitle } from '@vueuse/core'
import { addTask } from '@/repositories/taskRepository'
import type { Task } from '@/entities/task'
import TaskDetail from '@/components/tasks/TaskDetail.vue'
import dayjs from '@/logic/dayjs'

const router = useRouter()

useTitle('タスク登録')

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
  <el-row>
    <el-col>
      <el-button
        type="info"
        link
        :icon="BIconChevronLeft"
        @click="router.push('/tasks')"
      >
        一覧に戻る
      </el-button>
    </el-col>
  </el-row>

  <el-row justify="center">
    <el-col
      :xs="22"
      :sm="20"
      :md="18"
      :lg="14"
      :xl="10"
    >
      <h2>タスクの登録</h2>

      <TaskDetail
        :task="task"
        @commit="onSubmit"
      />
    </el-col>
  </el-row>
</template>

<style scoped>
.el-row:not(:last-child){
  margin-bottom: 15px;
}

h2{
  user-select: none;
}
</style>
