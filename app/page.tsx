'use client'

import dynamic from 'next/dynamic'
import '@tldraw/tldraw/tldraw.css'
import { MakeRealButton } from './components/MakeRealButton'
import { TldrawLogo } from './components/TldrawLogo'
import { RiskyButCoolAPIKeyInput } from './components/RiskyButCoolAPIKeyInput'
import { PreviewShapeUtil } from './PreviewShape/PreviewShape'
import {
	useEditor,
	useTools,
	DefaultToolbar,
	useIsToolSelected,
	TldrawUiMenuItem,
	DefaultToolbarContent,
	TLComponents,
} from '@tldraw/tldraw'

const Tldraw = dynamic(async () => (await import('@tldraw/tldraw')).Tldraw, {
	ssr: false,
})

const shapeUtils = [PreviewShapeUtil]

function CustomToolbar() {
	const editor = useEditor()
	const tools = useTools()
	const isScreenshotSelected = useIsToolSelected(tools['rhombus-2'])
	return (
		<div>
			<DefaultToolbar>
				<TldrawUiMenuItem {...tools['rhombus-2']} isSelected={isScreenshotSelected} />

				<DefaultToolbarContent />
				<button
					onClick={() => {
						editor.selectAll().deleteShapes(editor.getSelectedShapeIds())
					}}
					title="delete all"
				>
					🧨
				</button>
			</DefaultToolbar>
		</div>
	)
}

function SharePanel() {
	return <MakeRealButton />
}

const components: TLComponents = {
	Toolbar: CustomToolbar, // null will hide the panel instead
	SharePanel: SharePanel,
}

export default function App() {
	return (
		<div className="editor">
			<Tldraw persistenceKey="make-real" components={components} shapeUtils={shapeUtils}>
				<RiskyButCoolAPIKeyInput />
			</Tldraw>
		</div>
	)
}
