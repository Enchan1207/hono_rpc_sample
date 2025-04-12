// queryをfunctionalに再実装する

import type { z } from 'zod'

import type { ConditionNode } from './conditionTree'

type ElementOrder = 'asc' | 'desc'

// 型エイリアス
type Model = z.AnyZodObject

type Columns<M extends Model> = keyof M['shape']

type QueryStateBase<M extends Model> = {
  buildState: 'draft' | 'ready'
  model: M
  tableName: string
  range?: {
    limit: number
    offset?: number
  }
  order?: {
    key: Columns<M>
    order: ElementOrder
  }
  condition?: ConditionNode<M>
}

type DraftQueryState<M extends Model> = QueryStateBase<M> & { buildState: 'draft' }
type ReadyQueryState<M extends Model> = QueryStateBase<M> & { buildState: 'ready' }
type QueryState<M extends Model> = DraftQueryState<M> | ReadyQueryState<M>

interface Query<M extends Model> {
  limit(limit: number, offset?: number): this
  orderBy(key: Columns<M>, order?: ElementOrder): this
  where(condition: ConditionNode<M>): this
}

interface BuidableQuery<M extends Model> extends Query<M> { build(): string }

const buildQuery = <M extends Model>(state: QueryState<M>): Query<M> => ({
  limit: function (limit: number, offset?: number): Query<M> {
    const newState: QueryState<M> = {
      ...state,
      range: {
        limit,
        offset,
      },
    }
    return buildQuery(newState)
  },

  orderBy: function (key: Columns<M>, order?: ElementOrder): Query<M> {
    const newState: QueryState<M> = {
      ...state,
      order: {
        key,
        order: order ?? 'asc',
      },
    }
    return buildQuery(newState)
  },

  where: function (condition: ConditionNode<M>): Query<M> {
    const newState: QueryState<M> = {
      ...state,
      condition,
    }
    return buildQuery(newState)
  },
})
