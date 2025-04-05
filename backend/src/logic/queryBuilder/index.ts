import type { ConditionNode } from './conditionTree'
import {
  buildConditionQuery,
  buildConditionQueryParams,
  condition, every,
  some,
} from './conditionTree'

type ElementOrder = 'asc' | 'desc'

export class Query<T> {
  private elementLimit?: number
  private elementOffset?: number
  private elementConditionNode?: ConditionNode<T>
  private elementOrder?: {
    key: keyof T
    order: ElementOrder
  }

  limit(limit: number) {
    this.elementLimit = limit
    return this
  }

  offset(offset: number) {
    this.elementOffset = offset
    return this
  }

  orderBy(key: keyof T, order: ElementOrder = 'asc') {
    this.elementOrder = {
      key,
      order,
    }
    return this
  }

  where(node: ConditionNode<T>) {
    this.elementConditionNode = node
    return this
  }

  build() {
    // TODO: ビルドしてパラメータ突っ込んで返す
    const node = this.elementConditionNode
    if (node === undefined) {
      return
    }

    const query = buildConditionQuery(node)
    const params = buildConditionQueryParams(node)
    console.log(query)
    console.log(params)
    return
  }
};

type Task = {
  title: string
  user_id: number
}

new Query<Task>()
  .limit(2)
  .offset(4)
  .where(every(
    condition('title', '==', 'test'),
    some(
      condition('user_id', '!=', 2),
      condition('user_id', '!=', 3),
    ),
  ))
  .orderBy('title', 'asc')
  .build()
