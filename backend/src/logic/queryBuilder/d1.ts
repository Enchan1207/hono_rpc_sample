import { Query } from '.'
import { buildConditionQuery, buildConditionQueryParams } from './conditionTree'

export class D1Query<T> extends Query<T> {
  build(d1Database: D1Database, tableName: string): D1PreparedStatement {
    const node = this.elementConditionNode
    if (node === undefined) {
      return
    }

    const query = buildConditionQuery(node)
    const params = buildConditionQueryParams(node)

    return d1Database.prepare(query).bind(params)
  }
}
