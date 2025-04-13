import { ok } from 'neverthrow'

import type { Model, QueryState } from '../../query'
import { buildBaseQuery } from './base'
import { buildConditionQuery } from './condition'
import { buildOrderQuery } from './order'
import { buildRangeQuery } from './range'
import type { Command, CommandParameters } from './types'

export const buildStatement = <M extends Model>(state: QueryState<M>): {
  query: string
  params: CommandParameters<M>[]
} => {
  const command: Command<M> = {
    input: state,
    state: {
      query: '',
      index: 0,
      params: [],
    },
  }

  // ここでResultを持ち出すのは意味がないので、できればメソッドチェーン用の型を作りたかった
  // しかし難しすぎて断念
  const { state: { query, params } } = ok(command)
    .map(buildBaseQuery)
    .map(buildConditionQuery)
    .map(buildOrderQuery)
    .map(buildRangeQuery)
    .unwrapOr(command)

  return {
    query,
    params,
  }
}
