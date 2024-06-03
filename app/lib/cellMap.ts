import { observable, action, makeObservable, autorun, trace, IObservableValue } from 'mobx'

export type Cell = IObservableValue<string>

export class CellMap {
	context: Record<string, Cell> = observable({}, { name: 'context' })

	constructor() {
		makeObservable(this, {
			context: observable,
			setCell: action,
			removeCell: action,
			getCell: action,
		})
	}

	getCell(key: string): Cell {
		return this.context[key]
	}

	setCell(key: string, value: string) {
		const reactiveCell = observable.box(value, { name: key })
		this.context[key] = reactiveCell

		autorun(
			() => {
				trace(false) // this logs debug info
				const code = reactiveCell.get()

				// create the function based on the cell code
				const func = new Function('$', code)

				// evaluate the function, passing context as parameter
				console.log('Executing cell ' + key)
				func.apply(null, [this.context])
			},
			{ name: 'Cell ' + key }
		)
	}

	removeCell(key: string) {
		delete this.context[key]
	}
}
