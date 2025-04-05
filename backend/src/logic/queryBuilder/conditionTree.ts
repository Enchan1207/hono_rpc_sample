type Operator = '==' | '!=' | '<' | '>' | '>=' | '<='

type ConditionNodeBase<T> = { items: ConditionNode<T>[] }

type ConditionNodeSome<T> = ConditionNodeBase<T> & { type: 'some' }
type ConditionNodeEvery<T> = ConditionNodeBase<T> & { type: 'every' }

type ConditionCompositionNode<T> = ConditionNodeSome<T> | ConditionNodeEvery<T>

export type ConditionNode<T> =
  | ConditionItem<T, keyof T>
  | ConditionCompositionNode<T>

type ConditionItem<T, K extends keyof T> = {
  key: K
  operator: Operator
  value: T[K]
}

const isLeaf = <T>(node: ConditionNode<T>):
node is ConditionItem<T, keyof T> =>
  (node as { type: unknown }).type === undefined

/** 条件リーフを組み立てる */
export const condition = <T, K extends keyof T>(
  key: K,
  operator: Operator,
  value: T[K],
): ConditionItem<T, K> => ({
  key,
  operator,
  value,
})

/** 複数のノードのうちいずれかを満たす条件ノードを構成する */
export const some = <T>(...items: ConditionNode<T>[]):
ConditionNodeSome<T> => ({
  type: 'some',
  items,
})

/** 複数のノードのうち全てを満たす条件ノードを構成する */
export const every = <T>(...items: ConditionNode<T>[]):
ConditionNodeEvery<T> => ({
  type: 'every',
  items,
})

/**
 * 条件クエリに必要なパラメータの配列を構成する
 * @param node 条件ノード
 * @returns パラメータの配列
 */
export const buildConditionQueryParams = <T>(
  node: ConditionNode<T>,
): ConditionItem<T, keyof T>['value'][] => {
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
export const buildConditionQuery = <T>(node: ConditionNode<T>) => {
  const { query } = buildQuery(node, 1)
  return query
}

/**
 * 条件クエリを組み立てる (internal)
 * @param node 条件ノード
 * @param index プレースホルダインデックス
 * @returns 組み立てられたクエリと次のインデックス
 */
const buildQuery = <T>(
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
