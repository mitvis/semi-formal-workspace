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
	TLUiOverrides,
	DefaultKeyboardShortcutsDialog,
	DefaultKeyboardShortcutsDialogContent,
	TLUiKeyboardShortcutsDialogProps,
} from '@tldraw/tldraw'
import { CellTool } from './lib/cellTool'

const Tldraw = dynamic(async () => (await import('@tldraw/tldraw')).Tldraw, {
	ssr: false,
})

const uiOverrides: TLUiOverrides = {
	tools(editor, tools) {
		// Create a tool item in the ui's context.
		tools.cell = {
			id: 'cell',
			icon: tools['frame'].icon,
			label: 'Cell',
			kbd: 'c',
			onSelect: () => {
				editor.setCurrentTool('cell')
			},
		}
		return tools
	},
}

const shapeUtils = [PreviewShapeUtil]

function CustomToolbar() {
	const tools = useTools()
	const isCellSelected = useIsToolSelected(tools['cell'])
	return (
		<div>
			<DefaultToolbar>
				<TldrawUiMenuItem {...tools['cell']} isSelected={isCellSelected} />

				<DefaultToolbarContent />
			</DefaultToolbar>
		</div>
	)
}

function CustomKeyboardShortcutsDialog(props: TLUiKeyboardShortcutsDialogProps) {
	const tools = useTools()
	return (
		<DefaultKeyboardShortcutsDialog {...props}>
			<DefaultKeyboardShortcutsDialogContent />
			<TldrawUiMenuItem {...tools['cell']} />
		</DefaultKeyboardShortcutsDialog>
	)
}

function SharePanel() {
	return <MakeRealButton />
}

const components: TLComponents = {
	Toolbar: CustomToolbar, // null will hide the panel instead
	SharePanel: SharePanel,
	KeyboardShortcutsDialog: CustomKeyboardShortcutsDialog,
}

const customTools = [CellTool]

export default function App() {
	return (
		<div className="editor">
			<Tldraw
				persistenceKey="make-real"
				tools={customTools}
				components={components}
				shapeUtils={shapeUtils}
				overrides={uiOverrides}
			>
				<RiskyButCoolAPIKeyInput />
			</Tldraw>
		</div>
	)
}
