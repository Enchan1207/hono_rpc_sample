import type { Model } from '../../_query'
import type { ConditionQueryBuilt, OrderQueryBuilt } from './types'

export const buildOrderQuery = <M extends Model>({ input, state }: ConditionQueryBuilt<M>): OrderQueryBuilt<M> => {
  const orderBy = input.order
  if (orderBy === undefined) {
    return {
      input,
      state,
    }
  }

  const key = orderBy.key.toString()
  const order = orderBy.order.toUpperCase()

  return {
    input,
    state: {
      query: state.query + `ORDER BY ${key} ${order}`,
      index: state.index,
      params: state.params,
    },
  }
}
