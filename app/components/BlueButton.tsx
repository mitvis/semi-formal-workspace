import {
	useBlockNoteEditor,
	useComponentsContext,
	useEditorContentOrSelectionChange,
} from '@blocknote/react'
import '@blocknote/mantine/style.css'
import { useCallback, useState } from 'react'
import { Block } from '@blocknote/core'
import { Editor, createShapeId, getSvgAsImage, useEditor, useToasts } from '@tldraw/tldraw'
import { makeReal } from '../lib/makeReal'
import { blobToBase64 } from '../lib/blobToBase64'

// export function renderBlock({ block, editor }: { block: Block; editor: Editor }) {
// 	if (block.type === 'paragraph') {
// 		editor.createShape({
// 			type: 'text',
// 			props: {
// 				text: block.content[0].text,

// 				// position: block.position,
// 				// size: block.size,
// 			},
// 		})
// 	}
// }

// Custom Formatting Toolbar Button to toggle blue text & background color.
export function BlueButton(props: { selectedBlocks: Block[] }) {
	const tldrawEditor = useEditor()
	const editor = useBlockNoteEditor()
	const { addToast } = useToasts()

	const Components = useComponentsContext()!

	// // Tracks whether the text & background are both blue.
	// const [isSelected, setIsSelected] = useState<boolean>(
	// 	editor.getActiveStyles().textColor === 'blue' &&
	// 		editor.getActiveStyles().backgroundColor === 'blue'
	// )

	// // Updates state on content or selection change.
	// useEditorContentOrSelectionChange(() => {
	// 	setIsSelected(
	// 		editor.getActiveStyles().textColor === 'blue' &&
	// 			editor.getActiveStyles().backgroundColor === 'blue'
	// 	)
	// }, editor)

	const handleClick = useCallback(async () => {
		// editor.toggleStyles({
		// 	textColor: 'blue',
		// 	backgroundColor: 'blue',
		// })

		// for (const block of props.selectedBlocks) {
		// 	renderBlock({ block, editor: props.tldrawEditor })
		// }
		const newShapeId = createShapeId()

		// this await is apparently necessary to ensure that the shape is created before makeReal is called
		await tldrawEditor.createShape({
			type: 'block-note',
			id: newShapeId,
			x: -1000,
			y: 0,
			props: {
				initialContent: props.selectedBlocks,
			},
		})

		tldrawEditor.select(newShapeId)

		try {
			const input = document.getElementById('openai_key_risky_but_cool') as HTMLInputElement
			const apiKey = input?.value ?? null
			if (!apiKey) throw Error('Make sure the input includes your API Key!')
			const newShapeId = await makeReal(tldrawEditor, apiKey)
			if (newShapeId === undefined) {
				throw Error('Make Real failed')
			}

			const svgString = await tldrawEditor.getSvgString([newShapeId], {
				scale: 1,
				background: true,
			})

			if (svgString === undefined) {
				throw Error('Make Real failed')
			}

			const IS_SAFARI = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

			const blob = await getSvgAsImage(svgString.svg, IS_SAFARI, {
				type: 'png',
				quality: 0.8,
				scale: 1,
				height: svgString.height,
				width: svgString.width,
			})
			const dataUrl = await blobToBase64(blob!)

			editor.insertBlocks(
				[
					{
						id: newShapeId,
						type: 'image',
						props: {
							url: dataUrl,
						},
					},
				],
				props.selectedBlocks[props.selectedBlocks.length - 1].id,
				'after'
			)
		} catch (e) {
			console.error(e)
			addToast({
				icon: 'cross-2',
				title: 'Something went wrong',
				description: (e as Error).message.slice(0, 100),
			})
		}
		console.log('complete!')
	}, [tldrawEditor, props.selectedBlocks, addToast])

	return (
		<Components.FormattingToolbar.Button
			mainTooltip={'Make Real'}
			onClick={handleClick}
			// isSelected={isSelected}
		>
			Make Real
		</Components.FormattingToolbar.Button>
	)
}
