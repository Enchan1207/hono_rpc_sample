import type { Model, QueryState } from '@/logic/queryBuilder/_query'
import type { ConditionLeaf } from '@/logic/queryBuilder/conditionTree'

export type CommandParameters<M extends Model> =
  | ConditionLeaf<M, keyof M['shape']>['value'][]
  | number
  | string

export type Command<M extends Model> = {
  input: QueryState<M>
  state: {
    query: string
    index: number
    params: CommandParameters<M>[]
  }
}
