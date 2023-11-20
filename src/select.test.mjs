import { test, expect } from 'vitest'
import { select, alias, column, value, eq, ne, between } from './select'
import { marker } from './utils'

test('select basic', () => {
  const q = select('employees')
  expect(q.toSql()).to.equal('select * from employees')
})

test('select columns', () => {
  const q1 = select('employees').columns('firstname', 'lastname')
  expect(q1.toSql()).to.equal('select firstname, lastname from employees')

  const q2 = select('employees').column('firstname').column('lastname')
  expect(q2.toSql()).to.equal('select firstname, lastname from employees')
})

test('select columns with alias', () => {
  const q = select('employees')
    .column(alias('firstname', 'first'))
    .column(alias('lastname', 'last'))
  expect(q.toSql()).to.equal(
    'select firstname first, lastname last from employees'
  )
})

test('select columns and table with alias', () => {
  const q = select(alias('employees', 'e'))
    .column(column('firstname', 'e').alias('first'))
    .column(column('lastname', 'e').alias('last'))
  expect(q.toSql()).to.equal(
    'select e.firstname first, e.lastname last from employees e'
  )
})

test('select columns mixed with value', () => {
  const q = select('employees')
    .column('fullname')
    .column(value(0))
    .column(value('test'))
  expect(q.toSql()).to.equal('select fullname, 0, \'test\' from employees')
})

test('select with predicates', () => {
  const q1 = select('employees')
    .columns('first', 'last')
    .eq('dept')
    .ne(ne('hired_date', '0001-01-01'))

  expect(q1.toSql()).to.equal("select first, last from employees where dept=? and hired_date<>'0001-01-01'")

  const q2 = select(alias('employees', 'e'))
    .between(between(column('salary', 'e'), 2000, 3000))
  expect(q2.toSql()).to.equal('select * from employees e where e.salary between 2000 and 3000')

  const q3 = select(alias('employees', 'e')).in(column('dept', 'e'), ['it', 'sales', marker])
  expect(q3.toSql()).to.equal('select * from employees e where e.dept in (\'it\', \'sales\', ?)')
})

test('select with join', () => {
  let q = select(alias('employees', 'e'))
    .join(alias('departments', 'd'), eq(column('dept', 'e'), column('id', 'd')))
  expect(q.toSql()).to.equal('select * from employees e join departments d on e.dept=d.id')

  q = select(alias('employees', 'e'))
    .leftjoin(
      alias('departments', 'd'),
      eq(column('dept', 'e'), column('id', 'd')),
      eq(column('dept', 'e'), value('it'))
    )
  expect(q.toSql()).to.equal('select * from employees e left join departments d on e.dept=d.id and e.dept=\'it\'')

  q = select(alias('employees', 'e'))
    .rightjoin(alias('departments', 'd'), eq(column('dept', 'e'), column('id', 'd')))
  expect(q.toSql()).to.equal('select * from employees e right join departments d on e.dept=d.id')
})

test('select subquery', () => {
  const d = select('departments')
  const q = select(alias('employees', 'e')).join(alias(d, 'd'), eq(column('dept', 'e'), column('id', 'd')))

  expect(q.toSql()).to.equal('select * from employees e join (select * from departments) d on e.dept=d.id')
})

test('select order', () => {
  let q = select('employees').orderby('department', 'desc')
  expect(q.toSql()).to.equal('select * from employees order by department desc')
  q = select('employees').orderby('department')
  expect(q.toSql()).to.equal('select * from employees order by department asc')
})
