<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useTaskData } from '@/composables/useTaskData'
import TaskDetail from '@/components/tasks/TaskDetail.vue'

const route = useRoute<'/tasks/[id]'>()
const router = useRouter()

const {
  task, isLoading, error, update,
} = useTaskData(route.params.id)
</script>

<template>
  <el-row>
    <el-col>
      <el-button
        type="info"
        link
        :icon="ArrowLeft"
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
