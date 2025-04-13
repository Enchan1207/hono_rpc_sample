import type { Model } from '@/logic/queryBuilder/_query'
import type { ConditionLeaf, ConditionNode } from '@/logic/queryBuilder/conditionTree'
import { isLeaf } from '@/logic/queryBuilder/conditionTree'

import type { BaseQueryBuilt, ConditionQueryBuilt } from './types'

type ConditionParameters<M extends Model> = ConditionLeaf<M, keyof M['shape']>['value'][]

export const buildConditionQuery = <M extends Model>({ input, state }: BaseQueryBuilt<M>): ConditionQueryBuilt<M> => {
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
const buildParams = <M extends Model>(
  node: ConditionNode<M>,
): ConditionParameters<M>[] => {
  if (isLeaf(node)) {
    return [node.value]
  }
  else {
    return node.items.map(buildParams).flat()
  }
}
