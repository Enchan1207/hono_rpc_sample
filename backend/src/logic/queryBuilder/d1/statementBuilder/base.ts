import type { Model } from '@/logic/queryBuilder/query'

import type { Command } from './types'

export const buildBaseQuery = <M extends Model>({ input, state }: Command<M>): Command<M> => {
  const modelShape = input.model.shape as Record<string, unknown>
  const columns: (keyof M['shape'])[] = Object.keys(modelShape)
  const query = [
    'SELECT',
    columns.join(','),
    'FROM',
    input.tableName,
  ].join(' ')

  return {
    input,
    state: {
      query,
      index: state.index,
      params: state.params,
    },
  }
}
