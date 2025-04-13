import { z } from 'zod'

import {
  condition, every, some,
} from '../conditionTree'
import { buildD1Statement } from './statementBuilder'

describe('buildD1Statement', () => {
  const dummySchema = z.object({
    id: z.number(),
    name: z.string(),
  })

  test('ステートがない場合、ベースクエリのみが生成されること', () => {
    const result = buildD1Statement({
      model: dummySchema,
      tableName: 'users',
    })

    expect(result.query).toBe('SELECT id,name FROM users')
    expect(result.params).toStrictEqual([])
  })

  test('範囲ステートのうちlimitがある場合、必要なクエリとパラメータが生成されること', () => {
    const result = buildD1Statement({
      model: dummySchema,
      tableName: 'users',
      range: { limit: 10 },
    })

    expect(result.query).toBe('SELECT id,name FROM users LIMIT ?1')
    expect(result.params).toStrictEqual([10])
  })

  test('範囲ステートのうちlimit, offsetがある場合、必要なクエリとパラメータが生成されること', () => {
    const result = buildD1Statement({
      model: dummySchema,
      tableName: 'users',
      range: {
        limit: 10,
        offset: 2,
      },
    })

    expect(result.query).toBe('SELECT id,name FROM users LIMIT ?1 OFFSET ?2')
    expect(result.params).toStrictEqual([10, 2])
  })

  test('順序ステートがある場合、必要なクエリとパラメータが生成されること', () => {
    const result = buildD1Statement({
      model: dummySchema,
      tableName: 'users',
      order: {
        key: 'id',
        order: 'desc',
      },
    })

    expect(result.query).toBe('SELECT id,name FROM users ORDER BY id DESC')
    expect(result.params).toStrictEqual([])
  })

  test('順序ステートで方向を指定しなかった場合、ASCになること', () => {
    const result = buildD1Statement({
      model: dummySchema,
      tableName: 'users',
      order: { key: 'name' },
    })

    expect(result.query).toBe('SELECT id,name FROM users ORDER BY name ASC')
    expect(result.params).toStrictEqual([])
  })

  test('単一条件ステートがある場合', () => {
    const result = buildD1Statement({
      model: dummySchema,
      tableName: 'users',
      condition: condition('id', '==', 2),
    })

    expect(result.query).toBe('SELECT id,name FROM users WHERE ( id == ?1 )')
    expect(result.params).toStrictEqual([2])
  })

  test('複合条件ステートがある場合', () => {
    const result = buildD1Statement({
      model: dummySchema,
      tableName: 'users',
      condition: some(
        condition('id', '==', 2),
        every(
          condition('id', '>', 3),
          condition('name', '!=', 'admin'),
        ),
      ),
    })

    expect(result.query).toBe('SELECT id,name FROM users WHERE ( ( id == ?1 ) OR ( ( id > ?2 ) AND ( name != ?3 ) ) )')
    expect(result.params).toStrictEqual([2, 3, 'admin'])
  })

  test('全部盛り', () => {
    const result = buildD1Statement({
      model: dummySchema,
      tableName: 'users',
      range: {
        limit: 10,
        offset: 2,
      },
      order: {
        key: 'name',
        order: 'desc',
      },
      condition: some(
        condition('id', '==', 2),
        every(
          condition('id', '>', 3),
          condition('name', '!=', 'admin'),
        ),
      ),
    })

    expect(result.query).toBe('SELECT id,name FROM users WHERE ( ( id == ?1 ) OR ( ( id > ?2 ) AND ( name != ?3 ) ) ) ORDER BY name DESC LIMIT ?4 OFFSET ?5')
    expect(result.params).toStrictEqual([2, 3, 'admin', 10, 2])
  })
})
