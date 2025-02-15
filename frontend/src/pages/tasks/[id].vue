<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useTitle } from '@vueuse/core'
import { watch } from 'vue'
import { BIconChevronLeft } from 'bootstrap-icons-vue'
import { useTaskData } from '@/composables/useTaskData'
import TaskDetail from '@/components/tasks/TaskDetail.vue'
import type { Task } from '@/entities/task'
import { useTaskOperation } from '@/composables/useTaskOperation'

const route = useRoute<'/tasks/[id]'>()
const router = useRouter()

const title = useTitle('タスク詳細')

const {
  task, isLoading, error,
} = useTaskData(route.params.id)

const {
  update, remove, isOperating: _,
} = useTaskOperation()

watch(task, () => {
  title.value = task.value?.title
})

const onClickUpdate = async (input: Omit<Task, 'id'>) => {
  const exist = task.value
  if (exist === undefined) {
    ElMessage.warning('アイテムを読み込んでいます。')
    return
  }

  const result = await update({
    exist,
    input,
  })
  result.match(() => {
    ElMessage('更新しました。')
  }, (error) => {
    ElMessage.error(`更新に失敗しました: ${error.message}`)
  })
}

const onClickRemove = async () => {
  const exist = task.value
  if (exist === undefined) {
    ElMessage.warning('アイテムを読み込んでいます。')
    return
  }

  const result = await remove(exist.id)
  result.match((removed) => {
    ElMessage(`タスクアイテム 「${removed.title}」を削除しました。`)
    router.push('/tasks')
  }, (error) => {
    ElMessage.error(`削除に失敗しました: ${error.message}`)
  })
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
      <h2>タスクの編集</h2>

      <template v-if="isLoading">
        <div>now loading...</div>
      </template>

      <template v-if="error">
        <div>読み込みに失敗しました: {{ error.message }}</div>
      </template>

      <template v-if="task">
        <TaskDetail
          :task="task"
          @commit="onClickUpdate"
          @remove="onClickRemove"
        />
      </template>
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
