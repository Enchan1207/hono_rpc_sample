// queryをfunctionalに再実装する

import type { z } from 'zod'

import type { ConditionNode } from './conditionTree'

type ElementOrder = 'asc' | 'desc'

export type Model = z.AnyZodObject

type Columns<M extends Model> = keyof M['shape']

export type QueryState<M extends Model> = {
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

interface Query<M extends Model> {
  limit(limit: number, offset?: number): this
  orderBy(key: Columns<M>, order?: ElementOrder): this
  where(condition: ConditionNode<M>): this
}

export interface Operation<U> {
  //
  select<M extends Model>(model: M, tableName: string): Buildable<Query<M>, U>
}

type Buildable<T, U> = T & { build(): U }

type Builder<M extends Model, S extends QueryState<M>, U> = (state: S) => U

/**
 * ビルダーを渡して選択クエリビルダを構成する
 * @param builder ビルダー
 * @returns 構成されたクエリビルダ
 */
export const createSelectionQueryBuilder = <
  M extends Model,
  S extends QueryState<M>,
  U
>
(builder: Builder<M, S, U>): ((state: S) => Buildable<Query<M>, U>) => {
  const _build = (state: S): Buildable<Query<M>, U> => ({
    limit(limit: number, offset?: number): Buildable<Query<M>, U> {
      const newState: S = {
        ...state,
        range: {
          limit,
          offset,
        },
      }
      return _build(newState)
    },

    orderBy(key: Columns<M>, order?: ElementOrder): Buildable<Query<M>, U> {
      const newState: S = {
        ...state,
        order: {
          key,
          order: order ?? 'asc',
        },
      }
      return _build(newState)
    },

    where(condition: ConditionNode<M>): Buildable<Query<M>, U> {
      const newState: S = {
        ...state,
        condition,
      }
      return _build(newState)
    },

    build() {
      return builder(state)
    },
  })

  return _build
}
