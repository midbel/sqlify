import { test, expect } from 'vitest'
import { update } from './update'

test('test update', () => {
	const q = update('employees')
		.column('firstname')
		.column('lastname')

	expect(q.toSql()).to.equal('update employees set firstname=?, lastname=?')
})