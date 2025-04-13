import type { z } from 'zod'

type ConditionNodeBase<T extends z.AnyZodObject> = { items: ConditionNode<T>[] }

type ConditionNodeSome<T extends z.AnyZodObject> = ConditionNodeBase<T> & { type: 'some' }
type ConditionNodeEvery<T extends z.AnyZodObject> = ConditionNodeBase<T> & { type: 'every' }

type ConditionCompositionNode<T extends z.AnyZodObject> =
  | ConditionNodeSome<T>
  | ConditionNodeEvery<T>

type Operator = '==' | '!=' | '<' | '>' | '>=' | '<='

export type ConditionLeaf<T extends z.AnyZodObject, K extends keyof T['shape']> = {
  key: K
  operator: Operator
  value: z.infer<T['shape'][K]>
}

export type ConditionNode<T extends z.AnyZodObject> =
  | ConditionLeaf<T, keyof T['shape']>
  | ConditionCompositionNode<T>

/** 条件ノードがリーフかどうかを判断する */
export const isLeaf = <T extends z.AnyZodObject>(node: ConditionNode<T>):
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
