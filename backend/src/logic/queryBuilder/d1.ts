import type { z } from 'zod'

import { Query } from '.'
import type { ConditionLeaf, ConditionNode } from './conditionTree'
import { isLeaf } from './conditionTree'

export class D1Query<T extends z.AnyZodObject> extends Query<T> {
  build(d1Database: D1Database, tableName: string): D1PreparedStatement {
    const modelShape = this.modelSchema.shape as Record<string, unknown>
    const columns: (keyof T['shape'])[] = Object.keys(modelShape)

    const baseQuery = [
      'SELECT',
      columns.join(','),
      'FROM',
      tableName,
    ].join(' ')

    // TODO: 要素(ORDERBYとかWHEREとか)ごとのクエリ組み立て(値は埋め込みでなくバインド)
    // TODO: WHERE句以外でもバインドしたい需要を踏まえると、indexはこのレイヤまで取り回すべきか?

    return d1Database.prepare(baseQuery).bind(params)
  }
}

/**
 * 条件クエリに必要なパラメータの配列を構成する
 * @param node 条件ノード
 * @returns パラメータの配列
 */
const buildConditionQueryParams = <T extends z.AnyZodObject>(
  node: ConditionNode<T>,
): ConditionLeaf<T, keyof T['shape']>['value'][] => {
  if (isLeaf(node)) {
    return [node.value]
  }
  else {
    return node.items.map(buildConditionQueryParams).flat()
  }
}

/**
 * 条件式を組み立てる
 * @param node 条件ノード
 * @returns 組み立てられたクエリ
 */
const buildConditionExpression = <T extends z.AnyZodObject>
(node: ConditionNode<T>) => {
  const { query } = buildExpression(node, 1)
  return query
}

/**
 * 条件式を組み立てる (internal)
 * @param node 条件ノード
 * @param index プレースホルダインデックス
 * @returns 組み立てられたクエリと次のインデックス
 */
const buildExpression = <T extends z.AnyZodObject>(
  node: ConditionNode<T>,
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
