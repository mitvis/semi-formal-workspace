import '@blocknote/core/fonts/inter.css'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/mantine/style.css'
import {
	BaseBoxShapeUtil,
	HTMLContainer,
	ShapeProps,
	SvgExportContext,
	T,
	TLBaseShape,
} from '@tldraw/tldraw'
import { Block } from '@blocknote/core'
import { ReactElement } from 'react'
import html2canvas from 'html2canvas'
import * as htmlToImage from 'html-to-image'
import { downloadDataURLAsFile } from '../lib/downloadDataUrlAsFile'

export const getBase64FromUrl = async (url: string) => {
	const imageData = await fetch(url)
	const blob = await imageData.blob()
	return new Promise((resolve) => {
		const reader = new FileReader()
		reader.readAsDataURL(blob)
		reader.onloadend = () => {
			const base64data = reader.result
			resolve(base64data)
		}
	})
}
type IBlockNoteShape = TLBaseShape<
	'block-note',
	{ w: number; h: number; checked: boolean; text: string; initialContent: Block[] }
>

export class BlockNoteShape extends BaseBoxShapeUtil<IBlockNoteShape> {
	static override type = 'block-note' as const
	static override props: ShapeProps<IBlockNoteShape> = {
		w: T.number,
		h: T.number,
		checked: T.boolean,
		text: T.string,
		// initialState: T.arrayOf(T.object({})),
		initialContent: T.array as T.Validatable<Block[]>,
	}

	getDefaultProps(): IBlockNoteShape['props'] {
		return {
			w: 1000,
			h: 500,
			checked: false,
			text: '',
			initialContent: [],
		}
	}

	// [1]
	component(shape: IBlockNoteShape) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const editor = useCreateBlockNote({ initialContent: shape.props.initialContent })

		return (
			<HTMLContainer
				style={{
					// padding: 16,
					// height: shape.props.h,
					width: shape.props.w,
					// [a] This is where we allow pointer events on our shape
					pointerEvents: 'all',
					// backgroundColor: '#efefef',
					// overflow: 'hidden',
				}}
				id={shape.id}
			>
				<BlockNoteView editor={editor} />
			</HTMLContainer>
		)
	}

	// [5]
	indicator(shape: IBlockNoteShape) {
		return <rect width={shape.props.w} height={shape.props.h} />
	}

	override toSvg(
		shape: IBlockNoteShape,
		_ctx: SvgExportContext
	): ReactElement | Promise<ReactElement> {
		// const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
		// while screenshot is the same as the old one, keep waiting for a new one
		return new Promise((resolve, _) => {
			// if (window === undefined) return resolve(<g />)
			// const windowListener = (event: MessageEvent) => {
			// 	if (event.data.screenshot && event.data?.shapeid === shape.id) {
			// 		// const image = document.createElementNS('http://www.w3.org/2000/svg', 'image')
			// 		// image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', event.data.screenshot)
			// 		// image.setAttribute('width', shape.props.w.toString())
			// 		// image.setAttribute('height', shape.props.h.toString())
			// 		// g.appendChild(image)
			// 		window.removeEventListener('message', windowListener)
			// 		clearTimeout(timeOut)
			// 		resolve(
			// 			<g>
			// 				<image href={event.data.screenshot} width={shape.props.w} height={shape.props.h} />
			// 			</g>
			// 		)
			// 	}
			// }
			// const timeOut = setTimeout(() => {
			// 	resolve(<g />)
			// 	window.removeEventListener('message', windowListener)
			// }, 2000)
			// window.addEventListener('message', windowListener)
			// request new screenshot

			console.log('foo')

			const element = document.getElementById(shape.id)

			if (!element) return

			// // add crossOrigin="anonymous" to all img tags in the element
			// const imgTags = element?.querySelectorAll('img')
			// imgTags?.forEach((img) => {
			// 	img.setAttribute('crossOrigin', 'anonymous')
			// })
			// const imgs = document.querySelectorAll('img')
			// Promise.all(
			// 	Array.from(imgs).map((img) => {
			// 		console.log(img.src)
			// 		fetch(img.src)
			// 			.then((res) => res.blob())
			// 			.then(
			// 				(blob) =>
			// 					new Promise((resolve, reject) => {
			// 						const reader = new FileReader()
			// 						reader.onerror = reject
			// 						reader.onload = () => {
			// 							resolve(reader.result)
			// 						}
			// 						reader.readAsDataURL(blob)
			// 					})
			// 			)
			// 			.then((dataURL) => {
			// 				img.src = dataURL as string
			// 			})
			// 	})
			// )
			// 	.then(() => htmlToImage.toSvg(element))
			// 	.then((dataUrl) => {
			// 		downloadDataURLAsFile(dataUrl, 'tldraw-test.svg')
			// 		resolve(<g />)
			// 	})

			// console.log(element)

			// if (element) {
			// html2canvas(element, {
			// 	allowTaint: true,
			// 	useCORS: true,
			// }).then((canvas) => {
			// 	const data = canvas.toDataURL('image/png')
			// 	downloadDataURLAsFile(data, 'tldraw-test.png')
			// 	resolve(
			// 		<g>
			// 			<image href={data} width={shape.props.w} height={shape.props.h} />
			// 		</g>
			// 	)
			// })
			htmlToImage
				.toPng(element, {
					// fetchRequestInit: {
					// 	// method: 'GET',
					// 	// mode: 'cors',
					// 	// cache: 'no-cache',
					// 	// credentials: 'same-origin',
					// 	// headers: { 'Content-Type': 'application/json' },
					// 	mode: 'no-cors',
					// 	// cache: 'no-cache',
					// },
				})
				.then((dataUrl) => {
					downloadDataURLAsFile(dataUrl, 'tldraw-test.png')
					resolve(
						<g>
							<image
								href={dataUrl}
								width={shape.props.w}
								height={shape.props.h}
								crossOrigin="anonymous"
							/>
						</g>
					)
				})
			// }
		})
	}
}

/* 
This is a custom shape, for a more in-depth look at how to create a custom shape,
see our custom shape example.

[1]
This is where we describe how our shape will render

	[a] We need to set pointer-events to all so that we can interact with our shape. This CSS property is
	set to "none" off by default. We need to manually opt-in to accepting pointer events by setting it to
	'all' or 'auto'. 

	[b] We need to stop event propagation so that the editor doesn't select the shape
		when we click on the checkbox. The 'canvas container' forwards events that it receives
		on to the editor, so stopping propagation here prevents the event from reaching the canvas.
	
	[c] If the shape is not checked, we stop event propagation so that the editor doesn't
		select the shape when we click on the input. If the shape is checked then we allow that event to
		propagate to the canvas and then get sent to the editor, triggering clicks or drags as usual.

*/
