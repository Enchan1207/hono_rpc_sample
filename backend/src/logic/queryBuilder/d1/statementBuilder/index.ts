import type { Model, QueryState } from '../../_query'
import type { CommandParameters } from './types'

export const buildStatement = <M extends Model>(state: QueryState<M>): {
  query: string
  params: CommandParameters<M>[]
} => {
  return {
    query: '',
    params: [],
  }
}
