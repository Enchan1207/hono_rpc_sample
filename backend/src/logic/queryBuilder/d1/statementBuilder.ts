import { ok } from 'neverthrow'

import type { ConditionLeaf, ConditionNode } from '@/logic/queryBuilder/conditionTree'
import { isLeaf } from '@/logic/queryBuilder/conditionTree'
import type { Model, QueryState } from '@/logic/queryBuilder/query'

type CommandParameters<M extends Model> =
  | ConditionLeaf<M, keyof M['shape']>['value'][]
  | number
  | string

type Command<M extends Model> = {
  input: QueryState<M>
  state: {
    query: string
    index: number
    params: CommandParameters<M>[]
  }
}

/** クエリの状態からD1用のSQLを生成する */
export const buildD1Statement = <M extends Model>(state: QueryState<M>): {
  query: string
  params: CommandParameters<M>[]
} => {
  const command: Command<M> = {
    input: state,
    state: {
      query: '',
      index: 0,
      params: [],
    },
  }

  // ここでResultを持ち出すのは意味がないので、できればメソッドチェーン用の型を作りたかった
  // しかし難しすぎて断念
  const { state: { query, params } } = ok(command)
    .map(buildBaseStatement)
    .map(buildConditionStatement)
    .map(buildOrderStatement)
    .map(buildRangeStatement)
    .unwrapOr(command)

  return {
    query,
    params,
  }
}

/** SQLのベースになるステートメントを生成する */
const buildBaseStatement = <M extends Model>({ input, state }: Command<M>): Command<M> => {
  const modelShape = input.model.shape as Record<string, unknown>
  const columns: (keyof M['shape'])[] = Object.keys(modelShape)
  const query = [
    'SELECT',
    columns.join(','),
    'FROM',
    input.tableName,
  ].join(' ')

  return {
    input,
    state: {
      query,
      index: state.index,
      params: state.params,
    },
  }
}

/** 条件ステートメントを生成する */
const buildConditionStatement = <M extends Model>({ input, state }: Command<M>): Command<M> => {
  const condition = input.condition
  if (condition === undefined) {
    return {
      input,
      state,
    }
  }

  const expression = buildExpression(condition, state.index)
  const params = buildParams(condition)

  return {
    input,
    state: {
      query: state.query + ' WHERE ' + expression.query,
      index: expression.index,
      params: [...state.params, ...params],
    },
  }
}

/**
 * 条件式を組み立てる
 * @param node 条件ノード
 * @param index プレースホルダインデックス
 * @returns 組み立てられたクエリと次のインデックス
 */
const buildExpression = <M extends Model>(
  node: ConditionNode<M>,
  index: number,
): {
  query: string
  index: number
} => {
  if (isLeaf(node)) {
    const query = ['(', node.key, node.operator, `?${index}`, ')'].join(' ')
    return {
      query,
      index: index + 1,
    }
  }
  else {
    let currentIndex = index
    const queries: string[] = []
    for (const childNode of node.items) {
      const result = buildExpression(childNode, currentIndex)
      currentIndex = result.index
      queries.push(result.query)
    }

    const children = queries.join(node.type === 'every' ? ' AND ' : ' OR ')
    const query = ['(', children, ')'].join(' ')
    return {
      query,
      index,
    }
  }
}

/**
 * 条件式に必要なパラメータの配列を構成する
 * @param node 条件ノード
 * @returns パラメータの配列
 */
const buildParams = <M extends Model>(node: ConditionNode<M>): Command<M>['state']['params'][] => {
  if (isLeaf(node)) {
    return [node.value]
  }
  else {
    return node.items.map(buildParams).flat()
  }
}

/** 順序ステートメントを生成する */
const buildOrderStatement = <M extends Model>({ input, state }: Command<M>): Command<M> => {
  const orderBy = input.order
  if (orderBy === undefined) {
    return {
      input,
      state,
    }
  }

  const key = orderBy.key.toString()
  const order = orderBy.order.toUpperCase()

  return {
    input,
    state: {
      query: state.query + `ORDER BY ${key} ${order}`,
      index: state.index,
      params: state.params,
    },
  }
}

/** 範囲ステートメントを生成する */
const buildRangeStatement = <M extends Model>({ input, state }: Command<M>): Command<M> => {
  const range = input.range
  if (range === undefined) {
    return {
      input,
      state,
    }
  }

  const { limit, offset } = range
  if (offset === undefined) {
    return {
      input,
      state: {
        query: state.query + ` LIMIT ?${state.index}`,
        index: state.index + 1,
        params: [...state.params, limit],
      },
    }
  }

  return {
    input,
    state: {
      query: state.query + ` LIMIT ?${state.index} OFFSET ?${state.index + 1}`,
      index: state.index + 2,
      params: [...state.params, limit, offset],
    },
  }
}
