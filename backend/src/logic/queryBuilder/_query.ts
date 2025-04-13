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
  order?: {
    key: Columns<M>
    order: Order
  }
  condition?: ConditionNode<M>
}

interface Query<M extends Model> {
  limit(limit: number, offset?: number): this
  orderBy(key: Columns<M>, order?: Order): this
  where(condition: ConditionNode<M>): this
}

/**
 * データベースに対して行う操作
 * @template P 操作結果として得られるステートメントオブジェクトの型
*/
export interface Operation<P> {
  /** モデルとテーブル名を渡してアイテムを選択する */
  select<M extends Model>(model: M, tableName: string): Buildable<Query<M>, P>
}

type Buildable<T, U> = T & { build(): U }

/**
 * ビルダーを渡して選択クエリビルダを構成する
 * @param statementBuilder ステートメントビルダ
 * @returns 構成されたクエリビルダ
 */
export const createSelectionQueryBuilder = <
  M extends Model,
  S extends QueryState<M>,
  P
>(statementBuilder: (state: S) => P):
(state: S) => Buildable<Query<M>, P> => {
  const _build = (state: S): Buildable<Query<M>, P> => ({
    limit(limit, offset): Buildable<Query<M>, P> {
      const newState: S = {
        ...state,
        range: {
          limit,
          offset,
        },
      }
      return _build(newState)
    },

    orderBy(key, order): Buildable<Query<M>, P> {
      const newState: S = {
        ...state,
        order: {
          key,
          order: order ?? 'asc',
        },
      }
      return _build(newState)
    },

    where(condition): Buildable<Query<M>, P> {
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
