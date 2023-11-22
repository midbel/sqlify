import { sqlify } from './utils'
import { checkIdent } from './ident'

class Function {
	constructor(name, args) {
		this.name = name
		this.args = args
	}

	toSql () {
		const args = (Array.isArray(this.args) ? this.args : [this.args]).map(sqlify)
		return `${sqlify(this.name)}(${args.join(', ')})`
	}
}

function createExec(name, args) {
	if (typeof name === 'string') {
		name = checkIdent(name)
	}
	return new Function(name, args)
}

export {
	createExec as exec,
}