import { checkIdent } from './ident'
import { sqlify, isPrimitive, marker } from './utils'

class Column {
  constructor (name, schema) {
    this.name = name
    this.schema = schema
  }

  alias (name) {
  	return createAlias(this, name)
  }

  toSql () {
    if (!this.schema) {
      return sqlify(this.name)
    }
    return `${this.schema}.${sqlify(this.name)}`
  }
}

function createColumn (name, schema = '') {
  if (typeof name !== 'string') {
    throw new Error('expect name to be of type string')
  }
  if (typeof name === 'string') {
    name = checkIdent(name)
  }
  return new Column(name, schema)
}

class Alias {
  constructor (name, alias) {
    this.name = name
    this.alias = alias
  }

  toSql () {
    if (!this.alias) {
      return sqlify(this.name)
    }
    // if (this.name instanceof Select) {
    // 	return `(${sqlify(this.name)}) ${this.alias}`
    // }
    return `${sqlify(this.name)} ${this.alias}`
  }
}

function createAlias (name, alias) {
  if (name instanceof Value) {
    throw new Error('value can not be aliased')
  }
  if (typeof name === 'string') {
    name = checkIdent(name)
  }
  alias = checkIdent(alias)
  return new Alias(name, alias)
}

class Value {
  constructor (raw) {
    this.value = raw
  }

  toSql () {
  	if (typeof (this.value) === 'string') {
  		const v = this.value.replaceAll('\'', '\'\'')
  		return `'${v}'`
  	} else if (this.value instanceof Date) {
  		return this.value.toISOString()
  	}
    return this.value.toString()
  }
}

function createValue (value) {
  if (value === marker) {
    return value
  }
  if (isPrimitive(value)) {
    return new Value(value)
  }
  throw new Error(`invalid value type: ${value}`)
}

class Comparison {
  constructor (field, value = marker, op = '=') {
    this.field = field
    this.value = value
    this.op = op
  }

  toSql () {
    return [
      sqlify(this.field),
      this.op,
      sqlify(this.value)
    ].join('')
  }
}

function createComparison (field, value = marker, operator = '?') {
  if (typeof value === 'string') {
    value = createValue(value)
  }
  if (typeof field === 'string') {
    field = checkIdent(field)
  }
  return new Comparison(field, value, operator)
}

function createEqual (field, value = marker) {
  return createComparison(field, value, '=')
}

function createNotEqual (field, value = marker) {
  return createComparison(field, value, '<>')
}

function createLesserThan (field, value = marker) {
  return createComparison(field, value, '<')
}

function createLesserOrEqual (field, value = marker) {
  return createComparison(field, value, '<=')
}

function createGreaterThan (field, value = marker) {
  return createComparison(field, value, '>')
}

function createGreaterOrEqual (field, value = marker) {
  return createComparison(field, value, '>=')
}

export {
  createColumn as column,
  createValue as value,
  createAlias as alias,
  createEqual as eq,
  createNotEqual as ne,
  createLesserThan as lt,
  createLesserOrEqual as le,
  createGreaterThan as gt,
  createGreaterOrEqual as ge,
  createBetween as between
  // createIn as in,
}