import type {
  Model, Operation, QueryState,
} from './_query'
import { createSelectionQueryBuilder } from './_query'

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
