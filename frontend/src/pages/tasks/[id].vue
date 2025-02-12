<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useTitle } from '@vueuse/core'
import { watch } from 'vue'
import { ElMessage } from 'element-plus'
import { BIconChevronLeft } from 'bootstrap-icons-vue'
import { useTaskData } from '@/composables/useTaskData'
import TaskDetail from '@/components/tasks/TaskDetail.vue'

const route = useRoute<'/tasks/[id]'>()
const router = useRouter()

const title = useTitle('タスク詳細')

const {
  task, isLoading, error, update, remove,
} = useTaskData(route.params.id)

watch(task, () => {
  title.value = task.value?.title
})

const onClickRemove = async () => {
  await remove()
  const taskTitle = task.value?.title ?? '(不明)'
  ElMessage(`タスクアイテム 「${taskTitle}」を削除しました。`)
  router.push('/tasks')
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
        <div>some error occured: {{ error.message }}</div>
      </template>

      <template v-if="task">
        <TaskDetail
          :task="task"
          @commit="update"
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
