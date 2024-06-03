// https://codesandbox.io/p/sandbox/typecell-in-30-lines-of-mobx-npwhgm
import { observable, autorun, configure, trace } from 'mobx'

configure({
	enforceActions: 'never',
})

const context = observable({}, { name: 'context' })

export const cells = [
	observable.box("$.greeting = 'Hello world';", { name: 'code of cell 0' }),
	observable.box('console.log($.greeting);', { name: 'code of cell 1' }),
]

for (let i = 0; i < cells.length; i++) {
	const cell = cells[i]
	// this will automatically rerun when an accessed observable changes.
	// This could be:
	// a) the code of the cell (accessed at cell.get())
	// b) when a dependency under $ (context) has been updated
	autorun(
		() => {
			trace(false) // this logs debug info
			const code = cell.get()

			// create the function based on the cell code
			const func = new Function('$', code)

			// evaluate the function, passing context as parameter
			console.log('Executing cell ' + i)
			func.apply(null, [context])
		},
		{ name: 'Cell ' + i }
	)
}

;(window as any).cells = cells
export default () => {}

/*
Try executing this in the console:

cells[0].get();
cells[1].get()
cells[1].set('console.info($.greeting.toUpperCase())')
cells[0].set("$.greeting = 'Hello Cascais';")
*/
