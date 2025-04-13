import type { z } from 'zod'

import type { ConditionNode } from './conditionTree'

type Order = 'asc' | 'desc'

export type Model = z.AnyZodObject

type Columns<M extends Model> = keyof M['shape']

export type QueryState<M extends Model> = {
  model: M
  tableName: string
  range?: {
    limit: number
    offset?: number
  }
  orders?: {
    key: Columns<M>
    order?: Order
  }[]
  condition?: ConditionNode<M>
}

export interface Query<M extends Model> {
  limit(limit: number, offset?: number): this
  orderBy(key: Columns<M>, order?: Order): this
  where(condition: ConditionNode<M>): this
}

export type Buildable<T, U> = T & { build(): U }

/**
 * ビルダーを渡して選択クエリビルダを構成する
 * @param statementBuilder ステートメントビルダ
 * @returns 構成されたクエリビルダ
 */
export const createSelectionQueryBuilder = <
  M extends Model,
  S extends QueryState<M>,
  P
>(statementBuilder: (state: S) => P): ((state: S) => Buildable<Query<M>, P>) => {
  const _build = (state: S): Buildable<Query<M>, P> => ({
    limit(limit, offset) {
      const newState: S = {
        ...state,
        range: {
          limit,
          offset,
        },
      }
      return _build(newState)
    },

    orderBy(key, order) {
      const newState: S = {
        ...state,
        orders: [...state.orders ?? [], {
          key,
          order: order ?? 'asc',
        }],
      }
      return _build(newState)
    },

    where(condition) {
      const newState: S = {
        ...state,
        condition,
      }
      return _build(newState)
    },

    build: () => statementBuilder(state),
  })

  return _build
}
