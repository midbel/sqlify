import { sqlify, marker, isPrimitive } from './utils'

class Between {
  constructor (field, lower = marker, upper = marker) {
    this.field = field
    this.lower = lower
    this.upper = upper
  }

  toSql () {
    return `${sqlify(this.field)} between ${this.lower} and ${sqlify(this.upper)}`
  }
}

function createBetween (name, lower = marker, upper = marker) {
  if (typeof lower === 'string') {
    lower = createValue(lower)
  }
  if (typeof upper === 'string') {
    upper = createValue(upper)
  }
  return new Between(name, lower, upper)
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

class Alias {
  constructor (name, alias) {
    this.name = name
    this.alias = alias
  }

  toSql () {
    if (!this.alias) {
      return sqlify(this.name)
    }
    if (this.name instanceof Select) {
    	return `(${sqlify(this.name)}) ${this.alias}`
    }
    return `${sqlify(this.name)} ${this.alias}`
  }
}

class Order {
  constructor (column, order = 'asc') {
    this.column = column
    this.order = order
  }

  toSql () {
    return `${sqlify(this.column)} ${this.order}`
  }
}

class Join {
  constructor (table, cdt) {
    this.table = table
    this.cdt = cdt
    this.inner = true
    this.left = true
  }

  eq (column, value) {
    this.cdt.push(createEqual(column, value))
    return this
  }

  ne (column, value) {
    this.cdt.push(createNotEqual(column, value))
    return this
  }

  toSql () {
    const cs = this.cdt.map(sqlify)
    let q = 'join'
    if (!this.inner && this.left) {
      q = 'left join'
    } else if (!this.inner && !this.left) {
      q = 'right join'
    }
    q = `${q} ${sqlify(this.table)}`
    return `${q} on ${cs.join(' and ')}`
  }
}

class Union {
  constructor () {
    this.queries = []
    this.all = false
  }

  append (q) {
    this.queries.push(q)
    return this
  }

  toSql () {
    let q = 'union'
    if (this.all) {
      q = ` ${q} all `
    }
    return this.queries.map(sqlify).join(q)
  }
}

class Intersect {
  constructor () {
    this.queries = []
    this.all = false
  }

  append (q) {
    this.queries.push(q)
    return this
  }

  toSql () {
    let q = 'intersect'
    if (this.all) {
      q = ` ${q} all `
    }
    return this.queries.map(sqlify).join(q)
  }
}

class Except {
  constructor () {
    this.queries = []
    this.all = false
  }

  append (q) {
    this.queries.push(q)
    return this
  }

  toSql () {
    let q = 'except'
    if (this.all) {
      q = ` ${q} all `
    }
    return this.queries.map(sqlify).join(q)
  }
}

class Select {
  constructor (table) {
    this.distinct = false
    this.bases = [table]
    this.joins = []
    this.fields = []
    this.wheres = []
    this.groups = []
    this.orders = []
    this.count = 0
    this.offset = 0
  }

  union (other, all = false) {
  	const u = new Union()
  	u.all = all
  	u.append(this)
    if (!Array.isArray(other)) {
      other = [other]
    }
    other.forEAch(u.append)
  	return u
  }

  intersect (other, all = false) {
  	const i = new Intersect()
  	i.all = all
  	i.append(this)
    if (!Array.isArray(other)) {
      other = [other]
    }
    other.forEAch(i.append)
  	return i
  }

  except (other, all  = false) {
    const e = new Except()
    e.all = all
    e.append(this)
    if (!Array.isArray(other)) {
      other = [other]
    }
    other.forEAch(e.append)
    return e
  }

  from (table) {
  	this.bases.push(table)
  	return this
  }

  join (table, ...rest) {
  	const j = new Join(table, rest)
  	j.inner = true
  	j.left = true
  	this.joins.push(j)
  	return this
  }

  leftjoin (table, ...rest) {
  	const j = new Join(table, rest)
  	j.inner = false
  	j.left = true
  	this.joins.push(j)
  	return this
  }

  rightjoin (table, ...rest) {
  	const j = new Join(table, rest)
  	j.inner = false
  	j.left = false
  	this.joins.push(j)
  	return this
  }

  columns (...rest) {
    this.fields = this.fields.concat(rest)
    return this
  }

  column (name) {
    if (typeof name === 'string') {
      name = createColumn(name)
    }
    this.fields.push(name)
    return this
  }

  groupby (name) {
  	this.groups.push(name)
  	return this
  }

  orderby (name, order = 'asc') {
  	this.orders.push(new Order(name, order))
  	return this
  }

  eq (column) {
  	if (typeof column === 'string') {
  		column = createEqual(column)
  	}
  	this.wheres.push(column)
  	return this
  }

  ne (column) {
  	if (typeof column === 'string') {
  		column = createNotEqual(column)
  	}
  	this.wheres.push(column)
  	return this
  }

  lt (column) {
  	if (typeof column === 'string') {
  		column = createLesserThan(column)
  	}
  	this.wheres.push(column)
  	return this
  }

  le (column) {
  	if (typeof column === 'string') {
  		column = createLesserOrEqual(column)
  	}
  	this.wheres.push(column)
  	return this
  }

  gt (column) {
  	if (typeof column === 'string') {
  		column = createGreaterThan(column)
  	}
  	this.wheres.push(column)
  	return this
  }

  ge (column) {
  	if (typeof column === 'string') {
  		column = createGreaterOrEqual(column)
  	}
  	this.wheres.push(column)
  	return this
  }

  between (column) {
    if (typeof column === 'string') {
  		column = createBetween(column)
  	}
  	this.wheres.push(column)
  	return this
  }

  toSql () {
    let cs = ['*']
    if (this.fields.length > 0) {
      cs = this.fields.map(sqlify)
    }

    const tables = this.bases.map(sqlify)
    const kw = this.distinct ? 'select distinct' : 'select'
    let q = `${kw} ${cs.join(', ')} from ${tables.join(', ')}`

    if (this.joins.length > 0) {
    	const js = this.joins.map(sqlify)
    	q = `${q} ${js.join(' ')}`
    }

    if (this.wheres.length > 0) {
    	const ws = this.wheres.map(sqlify)
    	q = `${q} where ${ws.join(' and ')}`
    }

    if (this.groups.length > 0) {
    	const gs = this.groups.map(sqlify)
    	q = `${q} group by ${gs.join(', ')}`
    }

    if (this.orders.length > 0) {
    	const os = this.orders.map(sqlify)
    	q = `${q} order by ${os.join(', ')}`
    }

    if (this.count > 0) {
      q = `${q} limit ${this.count}`
    }

    if (this.offset > 0) {
      q = `${q} offset ${this.offset}`
    }
    return q
  }
}

function createSelect (table) {
  return new Select(table)
}

function createValue (value) {
  if (isPrimitive(value)) {
    return new Value(value)
  }
  throw new Error('invalid value type')
}

function createColumn (name, schema = '') {
  if (typeof name !== 'string') {
    throw new Error('expect name to be of type string')
  }
  return new Column(name, schema)
}

function createAlias (name, alias) {
  if (name instanceof Value) {
    throw new Error('value can not be aliased')
  }
  return new Alias(name, alias)
}

export {
  createSelect as select,
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
}
