import type {
  Model, Operation, QueryState,
} from './_query'
import { createSelectionQueryBuilder } from './_query'
import type { ConditionLeaf } from './conditionTree'

type ConditionParameters<M extends Model> = ConditionLeaf<M, keyof M['shape']>['value'][]

type Command<M extends Model> = {
  input: QueryState<M>
  state: {
    query: string
    index: number
    params: ConditionParameters<M>[]
  }
}

type BaseQueryBuilt<M extends Model> = Command<M> & { input: Omit<QueryState<M>, 'model' | 'tableName'> }
type ConditionQueryBuilt<M extends Model> = BaseQueryBuilt<M> & { input: Omit<QueryState<M>, 'condition'> }

const buildBaseQuery = <M extends Model>({ input, state }: Command<M>): BaseQueryBuilt<M> => {
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

const buildStatementBuilderD1 = (database: D1Database) => {
  const _builder = <M extends Model>(state: QueryState<M>):
  D1PreparedStatement => {
    database.prepare(state.tableName)
    throw new Error('not implemented')
  }
  return _builder
}

export const d1 = (database: D1Database): Operation<D1PreparedStatement> => ({
  select(model, tableName) {
    const builder = buildStatementBuilderD1(database)
    return createSelectionQueryBuilder(builder)({
      model,
      tableName,
    })
  },
})
