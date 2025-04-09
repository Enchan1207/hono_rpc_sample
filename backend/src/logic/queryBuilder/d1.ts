import type { z } from 'zod'

import { Query } from '.'
import type { ConditionLeaf, ConditionNode } from './conditionTree'
import { isLeaf } from './conditionTree'

type ConditionParameters<T extends z.AnyZodObject> = ConditionLeaf<T, keyof T['shape']>['value'][]

type QueryBuildResult<T extends z.AnyZodObject> = {
  query: string
  index: number
  params: ConditionParameters<T>
}

export class D1Query<T extends z.AnyZodObject> extends Query<T> {
  private buildBaseQuery(index: number = 1):
  QueryBuildResult<T> {
    const modelShape = this.modelSchema.shape as Record<string, unknown>
    const columns: (keyof T['shape'])[] = Object.keys(modelShape)

    const query = [
      'SELECT',
      columns.join(','),
      'FROM',
      this.tableName,
    ].join(' ')

    return {
      query,
      index,
      params: [],
    }
  }

  private buildConditionQuery(index: number = 1): QueryBuildResult<T> {
    const conditionNode = this.elementConditionNode
    if (conditionNode === undefined) {
      return {
        query: '',
        index,
        params: [],
      }
    }

    const expression = buildExpression(conditionNode, index)
    const params = buildConditionQueryParams(conditionNode)

    return {
      query: `WHERE ${expression.query}`,
      index: expression.index,
      params,
    }
  }

  private buildLimitQuery(index: number = 1): QueryBuildResult<T> {
    const limit = this.elementLimit
    if (limit === undefined) {
      return {
        query: '',
        index,
        params: [],
      }
    }
    return {
      query: `LIMIT ?${index}`,
      index: index + 1,
      params: [limit],
    }
  }

  private buildOffsetQuery(index: number = 1): QueryBuildResult<T> {
    const offset = this.elementOffset
    if (offset === undefined) {
      return {
        query: '',
        index,
        params: [],
      }
    }
    return {
      query: `OFFSET ?${index}`,
      index: index + 1,
      params: [offset],
    }
  }

  private buildOrderByQuery(index: number = 1): QueryBuildResult<T> {
    const orderBy = this.elementOrder
    if (orderBy === undefined) {
      return {
        query: '',
        index,
        params: [],
      }
    }

    const key = orderBy.key.toString()
    const order = orderBy.order.toUpperCase()

    return {
      query: `ORDER BY ${key} ${order}`,
      index,
      params: [],
    }
  }

  build(d1Database: D1Database): D1PreparedStatement {
    // なんかきれいじゃないなあ……

    const params: ConditionParameters<T>[] = []

    const base = this.buildBaseQuery(1)
    params.push(...base.params)

    const withCondition = this.buildConditionQuery(base.index)
    params.push(...withCondition.params)

    const withOrder = this.buildOrderByQuery(withCondition.index)
    params.push(...withOrder.params)

    const withLimit = this.buildLimitQuery(withOrder.index)
    params.push(...withLimit.params)

    const withOffset = this.buildOffsetQuery(withLimit.index)
    params.push(...withOffset.params)

    const baseQuery = [
      base.query,
      withCondition.query,
      withOrder.query,
      withLimit.query,
      withOffset.query,
    ].join(' ')

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
): ConditionParameters<T>[] => {
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
