import type { Model } from '../../query'
import type { Command } from './types'

export const buildOrderQuery = <M extends Model>({ input, state }: Command<M>): Command<M> => {
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
