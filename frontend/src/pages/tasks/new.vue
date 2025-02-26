<script setup lang="ts">
import { useTitle } from '@vueuse/core'
import { BIconChevronLeft } from 'bootstrap-icons-vue'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import TaskEditFormItems from '@/components/tasks/TaskEditFormItems.vue'
import type { Task } from '@/entities/task'
import { validateForm } from '@/logic/form'
import { addTask } from '@/repositories/taskRepository'

const router = useRouter()

useTitle('タスク登録')

type FormType = Omit<Task, 'id' | 'due'> & { due: Task['due'] | undefined }

const formModel = reactive<FormType>({
  title: '',
  priority: 'middle',
  due: undefined,
  description: '',
})
const formRef = ref<FormInstance>()

const isFormSubmitting = ref(false)

const onSubmit = async () => {
  if (formRef.value === undefined) {
    return
  }

  const validationResult = await validateForm(formRef.value, formModel)
  if (validationResult.isErr()) {
    return
  }
  const validated = validationResult.value

  isFormSubmitting.value = true
  const result = await addTask(validated as Omit<Task, 'id'>)
  result.match(({ title }) => {
    ElMessage(`タスク「${title}」を登録しました。`)
    router.back()
  }, (error) => {
    ElMessage.error(`登録に失敗しました: ${error.message}`)
  })
  isFormSubmitting.value = false
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
          :loading="isFormSubmitting"
        />

        <el-form-item>
          <el-button
            type="primary"
            :loading="isFormSubmitting"
            @click="onSubmit"
          >
            登録
          </el-button>
        </el-form-item>
      </el-form>
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
