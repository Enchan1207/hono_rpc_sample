import { z } from 'zod'

export const UserRecord = z.object({
  name: z.string(),
  auth0_user_id: z.string(),
  id: z.string(),
})

export type UserRecord = z.infer<typeof UserRecord>
