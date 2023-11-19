import { test, expect } from 'vitest'
import { insert } from './insert'
import { value } from './select'

test('test insert', () => {
  let q = insert('employees').columns('first', 'last', 'dept')
  expect(q.toSql()).to.equal('insert into employees (first, last, dept) values (?, ?, ?)')

  q = insert('employees')
    .value(value('john'))
    .value(value('smith'))
    .value('it')
  expect(q.toSql()).to.equal('insert into employees values (\'john\', \'smith\', \'it\')')
})
