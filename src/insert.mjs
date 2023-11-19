import { sqlify, marker } from './utils'
import { value } from './select'
import { isPrimitive } from './utils'

class Insert {
	constructor (table) {
		this.table = table
		this.fields = []
		this.values = []
	}

	columns (...rest) {
		this.fields = this.fields.concat(rest)
		return this
	}

	column (name) {
		this.fields.push(name)
		return this
	}

	value (val = marker) {
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

function insert(table) {
	return new Insert(table)
}

export {
	insert
}