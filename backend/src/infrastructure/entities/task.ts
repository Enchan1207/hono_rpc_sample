import { z } from 'zod'

export const TaskRecord = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string(),
  due: z.number(),
  priority: z.number(),
  description: z.string(),
})

export type TaskRecord = z.infer<typeof TaskRecord>

export const TaskSummaryRecord = TaskRecord.omit({ description: true })

export type TaskSummaryRecord = Omit<TaskRecord, 'description'>
