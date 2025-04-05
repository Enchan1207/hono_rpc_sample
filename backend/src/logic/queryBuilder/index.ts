import type { ConditionNode } from './conditionTree'

type ElementOrder = 'asc' | 'desc'

export class Query<T> {
  protected elementLimit?: number
  protected elementOffset?: number
  protected elementConditionNode?: ConditionNode<T>
  protected elementOrder?: {
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
};
