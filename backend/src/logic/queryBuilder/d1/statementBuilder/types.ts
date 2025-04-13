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

export type BaseQueryBuilt<M extends Model> = Omit<Command<M>, 'input'> & { input: Omit<Command<M>['input'], 'model' | 'tableName'> }
export type ConditionQueryBuilt<M extends Model> = Omit<BaseQueryBuilt<M>, 'input'> & { input: Omit<BaseQueryBuilt<M>['input'], 'condition'> }
export type OrderQueryBuilt<M extends Model> = Omit<ConditionQueryBuilt<M>, 'input'> & { input: Omit<ConditionQueryBuilt<M>['input'], 'order'> }
export type RangeQueryBuilt<M extends Model> = Omit<OrderQueryBuilt<M>, 'input'> & { input: Omit<OrderQueryBuilt<M>['input'], 'range'> }
