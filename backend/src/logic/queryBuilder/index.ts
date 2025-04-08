import type { z } from 'zod'

import type { ConditionNode } from './conditionTree'

type ElementOrder = 'asc' | 'desc'

type Model<T extends z.AnyZodObject> = T['shape']

export class Query<T extends z.AnyZodObject> {
  protected modelSchema: T

  protected elementLimit?: number
  protected elementOffset?: number
  protected elementConditionNode?: ConditionNode<T>
  protected elementOrder?: {
    key: keyof Model<T>
    order: ElementOrder
  }

  constructor(schema: T) {
    this.modelSchema = schema
  }

  limit(limit: number) {
    this.elementLimit = limit
    return this
  }

  offset(offset: number) {
    this.elementOffset = offset
    return this
  }

  orderBy(key: keyof Model<T>, order: ElementOrder = 'asc') {
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
