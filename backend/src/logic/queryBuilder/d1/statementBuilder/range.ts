import type { Model } from '../../query'
import type { Command } from './types'

export const buildRangeQuery = <M extends Model>({ input, state }: Command<M>): Command<M> => {
  const range = input.range
  if (range === undefined) {
    return {
      input,
      state,
    }
  }

  const { limit, offset } = range
  if (offset === undefined) {
    return {
      input,
      state: {
        query: state.query + ` LIMIT ?${state.index}`,
        index: state.index + 1,
        params: [...state.params, limit],
      },
    }
  }

  return {
    input,
    state: {
      query: state.query + ` LIMIT ?${state.index} OFFSET ?${state.index + 1}`,
      index: state.index + 2,
      params: [...state.params, limit, offset],
    },
  }
}
