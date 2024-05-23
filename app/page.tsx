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
	stopEventPropagation,
	Editor,
} from '@tldraw/tldraw'
import { CellTool } from './lib/cellTool'
import { BlockNoteShape, getBase64FromUrl } from './components/BlockNoteShape'
import { createContext, useState } from 'react'
import { BlockNoteView } from '@blocknote/mantine'
import {
	BasicTextStyleButton,
	BlockTypeSelect,
	ColorStyleButton,
	CreateLinkButton,
	FileCaptionButton,
	FileReplaceButton,
	FormattingToolbar,
	FormattingToolbarController,
	NestBlockButton,
	SuggestionMenuController,
	TextAlignButton,
	UnnestBlockButton,
	getDefaultReactSlashMenuItems,
	useCreateBlockNote,
	useEditorContentOrSelectionChange,
} from '@blocknote/react'
import { Block, filterSuggestionItems } from '@blocknote/core'
import { BlueButton } from './components/BlueButton'
import { blobToBase64 } from './lib/blobToBase64'
import { insertImage } from './components/ImageBlock'

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

const shapeUtils = [PreviewShapeUtil, BlockNoteShape]

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

async function uploadFile(file: File) {
	// const body = new FormData()
	// body.append('file', file)

	// const ret = await fetch('https://tmpfiles.org/api/v1/upload', {
	// 	method: 'POST',
	// 	body: body,
	// })

	// const imgUrl = (await ret.json()).data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/')

	// // const base64Encoding = await getBase64FromUrl(imgUrl)

	// // const url = `data:image/png;base64,${base64Encoding}`

	// return imgUrl

	if (file.type === 'image/jpeg' || file.type === 'image/png') {
		return blobToBase64(file)
	}
}

function MyComponent() {
	const tldrawEditor = useEditor()
	const [blocks, setBlocks] = useState<Block[]>([])
	const editor = useCreateBlockNote({
		uploadFile,
	})
	useEditorContentOrSelectionChange(() => {
		const selection = editor.getSelection()
		if (selection !== undefined) {
			setBlocks(selection.blocks)
		}
	}, editor)

	return (
		<>
			<div
				style={{
					position: 'absolute',
					top: -50,
					left: 50,
					width: 1000,
					padding: 12,
					borderRadius: 8,
					backgroundColor: 'goldenrod',
					zIndex: 0,
					userSelect: 'unset',
					// boxShadow: '0 0 0 1px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.1)',
				}}
				onPointerDown={stopEventPropagation}
				onPointerMove={stopEventPropagation}
			>
				{/* <p>The count is {state}! </p>
				<button onClick={() => setState((s) => s - 1)}>-1</button>
				<p>These components are on the canvas. They will scale with camera zoom like shapes.</p> */}
				<BlockNoteView editor={editor} formattingToolbar={false}>
					{/* <SuggestionMenuController
						triggerCharacter={'\\'}
						getItems={async (query) =>
							// Gets all default slash menu items and `insertAlert` item.
							filterSuggestionItems([...getDefaultReactSlashMenuItems(editor), insertImage], query)
						}
					/> */}
					<FormattingToolbarController
						formattingToolbar={() => (
							<FormattingToolbar>
								<BlockTypeSelect key={'blockTypeSelect'} />

								{/* Extra button to toggle blue text & background */}
								<BlueButton key={'customButton'} selectedBlocks={blocks} />

								<FileCaptionButton key={'fileCaptionButton'} />
								<FileReplaceButton key={'replaceFileButton'} />

								<BasicTextStyleButton basicTextStyle={'bold'} key={'boldStyleButton'} />
								<BasicTextStyleButton basicTextStyle={'italic'} key={'italicStyleButton'} />
								<BasicTextStyleButton basicTextStyle={'underline'} key={'underlineStyleButton'} />
								<BasicTextStyleButton basicTextStyle={'strike'} key={'strikeStyleButton'} />
								{/* Extra button to toggle code styles */}
								<BasicTextStyleButton key={'codeStyleButton'} basicTextStyle={'code'} />

								<TextAlignButton textAlignment={'left'} key={'textAlignLeftButton'} />
								<TextAlignButton textAlignment={'center'} key={'textAlignCenterButton'} />
								<TextAlignButton textAlignment={'right'} key={'textAlignRightButton'} />

								<ColorStyleButton key={'colorStyleButton'} />

								<NestBlockButton key={'nestBlockButton'} />
								<UnnestBlockButton key={'unnestBlockButton'} />

								<CreateLinkButton key={'createLinkButton'} />
							</FormattingToolbar>
						)}
					/>
				</BlockNoteView>
				<pre>
					<code>{JSON.stringify(blocks, null, 2)}</code>
				</pre>
			</div>
		</>
	)
}

const components: TLComponents = {
	Toolbar: CustomToolbar, // null will hide the panel instead
	SharePanel: SharePanel,
	KeyboardShortcutsDialog: CustomKeyboardShortcutsDialog,
	OnTheCanvas: MyComponent,
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
				// onMount={(editor) => {
				// 	editor.createShape({ type: 'block-note', x: -1000, y: 100 })
				// }}
			>
				<RiskyButCoolAPIKeyInput />
			</Tldraw>
		</div>
	)
}
