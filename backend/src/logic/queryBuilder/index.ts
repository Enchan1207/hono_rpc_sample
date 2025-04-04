type Operator = '==' | '!=' | '<' | '>' | '>=' | '<='
type ConditionExpression<T, K extends keyof T> = {
  operator: Operator
  value: T[K]
}

type ElementCondition<T> = { [key in keyof T]: ConditionExpression<T, keyof T> }
type ElementOrder = 'asc' | 'desc'

export class Query<T> {
  private elementLimit?: number
  private elementOffset?: number
  private elementConditions: ElementCondition<T> = {} as ElementCondition<T>
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

  where(key: keyof T, operator: Operator, value: T[typeof key]) {
    this.elementConditions[key] = {
      operator,
      value,
    }
    return this
  }

  build() {
    // TODO: ビルドしてパラメータ突っ込んで返す
    console.log(this.elementLimit)
    console.log(this.elementOffset)
    console.log(JSON.stringify(this.elementConditions))
    console.log(this.elementOrder)
    return ''
  }
};

type Task = {
  title: string
  user_id: number
}

new Query<Task>()
  .limit(2)
  .offset(4)
  .where('title', '==', 'test')
  .orderBy('title', 'asc')
  .where('user_id', '!=', 2)
  .build()
