import type { z } from 'zod'

type ConditionNodeBase<T extends z.AnyZodObject> = { items: ConditionNode<T>[] }

type ConditionNodeSome<T extends z.AnyZodObject> = ConditionNodeBase<T> & { type: 'some' }
type ConditionNodeEvery<T extends z.AnyZodObject> = ConditionNodeBase<T> & { type: 'every' }

type ConditionCompositionNode<T extends z.AnyZodObject> =
  | ConditionNodeSome<T>
  | ConditionNodeEvery<T>

type Operator = '==' | '!=' | '<' | '>' | '>=' | '<='

type ConditionLeaf<T extends z.AnyZodObject, K extends keyof T['shape']> = {
  key: K
  operator: Operator
  value: z.infer<T['shape'][K]>
}

export type ConditionNode<T extends z.AnyZodObject> =
  | ConditionLeaf<T, keyof T['shape']>
  | ConditionCompositionNode<T>

const isLeaf = <T extends z.AnyZodObject>(node: ConditionNode<T>):
node is ConditionLeaf<T, keyof T['shape']> =>
  (node as { type: unknown }).type === undefined

/** 条件リーフを組み立てる */
export const condition = <T extends z.AnyZodObject, K extends keyof T['shape']>(
  key: ConditionLeaf<T, K>['key'],
  operator: ConditionLeaf<T, K>['operator'],
  value: ConditionLeaf<T, K>['value'],
): ConditionLeaf<T, K> => ({
  key,
  operator,
  value,
})

/** 複数のノードのうちいずれかを満たす条件ノードを構成する */
export const some = <T extends z.AnyZodObject>(...items: ConditionNode<T>[]):
ConditionNodeSome<T> => ({
  type: 'some',
  items,
})

/** 複数のノードのうち全てを満たす条件ノードを構成する */
export const every = <T extends z.AnyZodObject>(...items: ConditionNode<T>[]):
ConditionNodeEvery<T> => ({
  type: 'every',
  items,
})

/**
 * 条件クエリに必要なパラメータの配列を構成する
 * @param node 条件ノード
 * @returns パラメータの配列
 */
export const buildConditionQueryParams = <T extends z.AnyZodObject>(
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
 * 条件クエリを組み立てる
 * @param node 条件ノード
 * @returns 組み立てられたクエリ
 */
export const buildConditionQuery = <T extends z.AnyZodObject>
(node: ConditionNode<T>) => {
  const { query } = buildQuery(node, 1)
  return query
}

/**
 * 条件クエリを組み立てる (internal)
 * @param node 条件ノード
 * @param index プレースホルダインデックス
 * @returns 組み立てられたクエリと次のインデックス
 */
const buildQuery = <T extends z.AnyZodObject>(
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
      const result = buildQuery(childNode, currentIndex)
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
