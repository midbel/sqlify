import { sqlify, marker, isPrimitive } from './utils'
import { checkIdent } from './ident'
import { value } from './select'

class Insert {
  constructor (table) {
  	if (typeof table === 'string') {
  		table = checkIdent(table)
  	}
    this.table = table
    this.fields = []
    this.values = []
    this.query = null
  }

  columns (...rest) {
  	rest.forEach(this.column)
    return this
  }

  column (name) {
  	if (typeof name === 'string') {
  		name = checkIdent(name)
  	}
    this.fields.push(name)
    return this
  }

  select (query) {
    if (this.values.length > 0) {
      throw new Error('choose between query or value - not both!')
    }
    this.query = query
    return this
  }

  value (val = marker) {
    if (this.query) {
      throw new Error('choose between query or value - not both!')
    }
    if (isPrimitive(val)) {
      val = value(val)
    }
    this.values.push(val)
    return this
  }

  toSql () {
    let q = `insert into ${sqlify(this.table)}`
    if (this.fields.length > 0) {
      const fs = this.fields.map(sqlify)
      q = `${q} (${fs.join(', ')})`
    }
    if (this.query) {
      return `${q} ${sqlify(this.query)}`
    }

    let vs = []
    if (this.values.length == 0) {
      vs = this.fields.map(() => sqlify(marker))
    } else {
      vs = this.values.map(sqlify)
    }
    q = `${q} values (${vs.join(', ')})`
    return q
  }
}

function insert (table) {
  return new Insert(table)
}

export {
  insert
}
