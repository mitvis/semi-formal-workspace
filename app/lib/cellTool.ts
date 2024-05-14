import { StateNode } from '@tldraw/tldraw'

// Check out the custom tool example for a more detailed explanation of the tool class.

const OFFSET = 12
export class CellTool extends StateNode {
	static override id = 'cell'

	override onEnter = () => {
		this.editor.setCursor({ type: 'cross', rotation: 0 })
	}

	override onPointerDown = () => {
		const { currentPagePoint } = this.editor.inputs
		this.editor.createShape({
			type: 'frame',
			x: currentPagePoint.x - OFFSET,
			y: currentPagePoint.y - OFFSET,
			props: {
				// html: '<div>test</div>',
				name: 'untitled',
				w: (960 * 2) / 3,
				h: (540 * 2) / 3,
			},
		})

		if (this.editor.getInstanceState().isToolLocked) {
			this.editor.setCurrentTool('cell')
		} else {
			this.editor.setCurrentTool('select.idle')
		}
	}
}
