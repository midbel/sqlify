import { test, expect } from 'vitest'
import { checkIdent } from './ident'

test('valid identifiers', () => {
  expect(checkIdent('f')).toBeTruthy()
  expect(checkIdent('F')).toBeTruthy()
  expect(checkIdent('field')).toBeTruthy()
  expect(checkIdent('field1')).toBeTruthy()
  expect(checkIdent('field_1')).toBeTruthy()
  expect(checkIdent('FIELD')).toBeTruthy()
  expect(checkIdent('FIELD1')).toBeTruthy()
  expect(checkIdent('FIELD_1')).toBeTruthy()
})

test('invalid identifier', () => {
  expect(checkIdent).toThrow()
  expect(() => checkIdent('_')).toThrow()
  expect(() => checkIdent('1f')).toThrow()
})
