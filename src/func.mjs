import { sqlify } from './utils'

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

export {
	createExec as exec,
}