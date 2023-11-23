import { sqlify } from './utils'
import { checkIdent } from './ident'

class Update {
	constructor(table) {
	  	if (typeof table === 'string') {
	  		table = checkIdent(table)
	  	}
	    this.table = table
	    this.fields = []
	    this.wheres = []
	}

	toSql() {
		let fs = this.fields.map(sqlify)
		let q = `update ${sqlify(this.table)} set ${fs.join(', ')}`
		if (this.wheres.length > 0) {
			const ws = this.wheres.map(sqlify)
			q = `${q} where ${ws.join(' and ')}`
		}
		return q
	}
}

function update (table) {
  return new Update(table)
}

export {
  update
}