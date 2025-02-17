<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useTitle } from '@vueuse/core'
import {
  reactive, ref, watch,
} from 'vue'
import type { Ref } from 'vue'
import { BIconChevronLeft } from 'bootstrap-icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { useTaskData } from '@/composables/useTaskData'
import type { Task } from '@/entities/task'
import { useTaskOperation } from '@/composables/useTaskOperation'
import TaskEditFormItems from '@/components/tasks/TaskEditFormItems.vue'
import { validateForm } from '@/logic/form'

const route = useRoute<'/tasks/[id]'>()
const router = useRouter()

const title = useTitle('タスク詳細')

const {
  task, isLoading, error,
} = useTaskData(route.params.id)

const {
  update, remove, isOperating,
} = useTaskOperation()

type FormType = Omit<Task, 'id' | 'due'> & { due: Task['due'] | undefined }

const formModel = reactive<FormType>({
  title: '',
  priority: 'middle',
  due: undefined,
  description: '',
})
const formRef = ref<FormInstance>()

const currentFormOperation: Ref<'update' | 'remove' | undefined> = ref()

watch(task, (task) => {
  if (task === undefined) {
    return
  }
  title.value = task.title

  formModel.title = task.title
  formModel.priority = task.priority
  formModel.due = task.due
  formModel.description = task.description
})

const onClickUpdate = async () => {
  const exist = task.value
  if (exist === undefined) {
    ElMessage.warning('アイテムを読み込んでいます。')
    return
  }

  if (formRef.value === undefined) {
    return
  }

  const validationResult = await validateForm(formRef.value, formModel)
  if (validationResult.isErr()) {
    return
  }
  const validated = validationResult.value

  currentFormOperation.value = 'update'
  const updateResult = await update({
    exist,
    input: validated as Omit<Task, 'id'>,
  })
  updateResult.match(() => {
    ElMessage('更新しました。')
  }, (error) => {
    ElMessage.error(`更新に失敗しました: ${error.message}`)
  })
  currentFormOperation.value = undefined
}

const onClickRemove = async () => {
  const exist = task.value
  if (exist === undefined) {
    ElMessage.warning('アイテムを読み込んでいます。')
    return
  }

  currentFormOperation.value = 'remove'
  const result = await remove(exist.id)
  result.match((removed) => {
    ElMessage(`タスクアイテム 「${removed.title}」を削除しました。`)
    router.back()
  }, (error) => {
    ElMessage.error(`削除に失敗しました: ${error.message}`)
  })
  currentFormOperation.value = undefined
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
        <el-form
          ref="formRef"
          label-position="left"
          label-width="80"
          :model="formModel"
        >
          <TaskEditFormItems
            v-model:title="formModel.title"
            v-model:due="formModel.due"
            v-model:priority="formModel.priority"
            v-model:description="formModel.description"
            :loading="currentFormOperation !== undefined"
          />
          <el-form-item>
            <el-button
              type="primary"
              :loading="currentFormOperation === 'update'"
              :disabled="isOperating"
              @click="onClickUpdate"
            >
              更新
            </el-button>
            <el-button
              type="danger"
              :loading="currentFormOperation === 'remove'"
              :disabled="isOperating"
              @click="onClickRemove"
            >
              削除
            </el-button>
            <el-button
              type="info"
              :disabled="isOperating"
              @click="formRef?.resetFields()"
            >
              変更前に戻す
            </el-button>
          </el-form-item>
        </el-form>
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
