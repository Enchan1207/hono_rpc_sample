import type {
  Buildable, Model, Query,
} from './query'

/**
 * データベースに対して行う操作
 * @template P 操作結果として得られるステートメントオブジェクトの型
*/
export interface Operation<P> {
  /** モデルとテーブル名を渡してアイテムを選択する */
  select<M extends Model>(model: M, tableName: string): Buildable<Query<M>, P>
}
