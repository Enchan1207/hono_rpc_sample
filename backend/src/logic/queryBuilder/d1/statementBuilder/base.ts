import type { Model } from '@/logic/queryBuilder/_query'

import type { BaseQueryBuilt, Command } from './types'

export const buildBaseQuery = <M extends Model>({ input, state }: Command<M>): BaseQueryBuilt<M> => {
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
