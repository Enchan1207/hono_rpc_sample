<script setup lang="ts">
import { useRouter } from 'vue-router'
import { reactive, ref } from 'vue'
import type { Ref } from 'vue'
import { BIconChevronLeft } from 'bootstrap-icons-vue'
import { useTitle } from '@vueuse/core'
import type { FormInstance } from 'element-plus'
import type { Result } from 'neverthrow'
import { err, ok } from 'neverthrow'
import type { Task } from '@/entities/task'
import TaskEditFormItems from '@/components/tasks/TaskEditFormItems.vue'
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

const validateForm = async <T>(
  formInstance: Ref<FormInstance | undefined>,
  data: T,
): Promise<Result<T, Error>> => {
  if (formInstance.value === undefined) {
    return err(new Error('Form instance is not yet ready'))
  }
  try {
    await formInstance.value.validate()
    return ok(data)
  }
  catch (e: unknown) {
    const error = e instanceof Error ? e : new Error('form validation error')
    return err(error)
  }
}

const onSubmit = async () => {
  const validated = (await validateForm(formRef, formModel)).unwrapOr(undefined)
  if (validated === undefined) {
    return
  }

  isFormSubmitting.value = true
  const result = await addTask(validated as Omit<Task, 'id'>)
  result.match(({ title }) => {
    ElMessage(`タスク「${title}」を登録しました。`)
    router.push('/tasks')
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
