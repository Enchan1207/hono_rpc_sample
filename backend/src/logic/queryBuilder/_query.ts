// queryをfunctionalに再実装する

import type { z } from 'zod'

import type { ConditionNode } from './conditionTree'

type ElementOrder = 'asc' | 'desc'

type ModelKeys<T extends z.AnyZodObject> = keyof T['shape']

type QueryState<T extends z.AnyZodObject> = {
  tableName: string
  range?: {
    limit: number
    offset?: number
  }
  order?: {
    key: ModelKeys<T>
    order: ElementOrder
  }
  condition?: ConditionNode<T>
}

interface Query<T extends z.AnyZodObject> {
  limit(limit: number, offset?: number): this
  orderBy(key: ModelKeys<T>, order?: ElementOrder): this
  where(condition: ConditionNode<T>): this
}

const buildQuery = <T extends z.AnyZodObject>(state: QueryState<T>):
Query<T> => ({
  limit: function (limit: number, offset?: number): Query<T> {
    const newState: QueryState<T> = {
      ...state,
      range: {
        limit,
        offset,
      },
    }
    return buildQuery(newState)
  },

  orderBy: function (key: ModelKeys<T>, order?: ElementOrder): Query<T> {
    const newState: QueryState<T> = {
      ...state,
      order: {
        key,
        order: order ?? 'asc',
      },
    }
    return buildQuery(newState)
  },

  where: function (condition: ConditionNode<T>): Query<T> {
    const newState: QueryState<T> = {
      ...state,
      condition,
    }
    return buildQuery(newState)
  },
})
