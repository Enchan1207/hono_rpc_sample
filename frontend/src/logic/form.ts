import type { FormInstance } from 'element-plus'
import type { Result } from 'neverthrow'
import { err, ok } from 'neverthrow'
import type { Ref } from 'vue'
import { toValue } from 'vue'

/** フォームをバリデーションして結果を返す */
export const validateForm = async <T>(
  form: Ref<FormInstance> | FormInstance,
  data: T,
): Promise<Result<T, Error>> => {
  try {
    await toValue(form).validate()
    return ok(data)
  }
  catch (e: unknown) {
    const error = e instanceof Error ? e : new Error('form validation error')
    return err(error)
  }
}
