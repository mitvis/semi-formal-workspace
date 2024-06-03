import { Editor, createShapeId, getSvgAsImage, track } from '@tldraw/tldraw'
import { getSelectionAsText } from './getSelectionAsText'
import { getHtmlFromOpenAI } from './getHtmlFromOpenAI'
import { blobToBase64 } from './blobToBase64'
import { addGridToSvg } from './addGridToSvg'
import { PreviewShape } from '../PreviewShape/PreviewShape'
import { downloadDataURLAsFile } from './downloadDataUrlAsFile'

export async function makeReal(editor: Editor, apiKey: string) {
	// debugger
	// Get the selected shapes (we need at least one)
	const selectedShapes = editor.getSelectedShapes()
	console.log(selectedShapes)

	if (selectedShapes.length === 0) throw Error('First select something to make real.')

	// Get an SVG based on the selected shapes
	const svg = await editor.getSvgElement(selectedShapes, {
		scale: 1,
		background: true,
	})
	const svgString = await editor.getSvgString(selectedShapes, {
		scale: 1,
		background: true,
	})

	if (!svg || !svgString) {
		console.warn('svg failed')
		console.log('svg', svg)
		console.log('svgString', svgString)
		return
	}

	// Add the grid lines to the SVG
	const grid = { color: 'red', size: 100, labels: true }
	addGridToSvg(svg.svg, grid)

	if (!svg) throw Error(`Could not get the SVG.`)

	// Turn the SVG into a DataUrl
	const IS_SAFARI = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

	const blob = await getSvgAsImage(svgString.svg, IS_SAFARI, {
		type: 'png',
		quality: 0.8,
		scale: 1,
		height: svgString.height,
		width: svgString.width,
	})
	const dataUrl = await blobToBase64(blob!)
	// downloadDataURLAsFile(dataUrl, 'tldraw.png')

	// Get any previous previews among the selected shapes
	const previousPreviews = selectedShapes.filter((shape) => {
		return shape.type === 'response'
	}) as PreviewShape[]

	// Send everything to OpenAI and get some HTML back
	// const newShapeId = createShapeId()
	try {
		// Create the preview shape
		// const { minX, minY, midY, maxY } = editor.getSelectionPageBounds()!
		// editor.createShape<PreviewShape>({
		// 	id: newShapeId,
		// 	type: 'response',
		// 	x: minX /*  - (960 * 2) / 3 / 2 */, // center of the preview's initial shape width
		// 	// y: maxY + 60, // below the selection
		// 	y: minY,
		// 	props: { html: '' },
		// })

		const json = await getHtmlFromOpenAI({
			image: dataUrl,
			apiKey,
			text: getSelectionAsText(editor),
			previousPreviews,
			// grid,
			// theme: editor.user.getUserPreferences().isDarkMode ? 'dark' : 'light',
		})

		if (!json) {
			throw Error('Could not contact OpenAI.')
		}

		if (json?.error) {
			throw Error(`${json.error.message?.slice(0, 128)}...`)
		}

		// // Extract the HTML from the response
		// const message = json.choices[0].message.content
		// const start = message.indexOf('<!DOCTYPE html>')
		// const end = message.indexOf('</html>')
		// const html = message.slice(start, end + '</html>'.length)

		// // No HTML? Something went wrong
		// if (html.length < 100) {
		// 	console.warn(message)
		// 	throw Error('Could not generate a design from those wireframes.')
		// }

		// the response will either be in a json, typescript/ts, or html code fence.
		// this is a smaller parser that tries each of them until it finds one.
		const message = json.choices[0].message.content
		let html = ''
		let jsonResponse = ''
		let tsResponse = ''

		// Try to extract HTML
		const htmlStart = message.indexOf('<!DOCTYPE html>')
		const htmlEnd = message.indexOf('</html>')
		if (htmlStart !== -1 && htmlEnd !== -1) {
			html = message.slice(htmlStart, htmlEnd + '</html>'.length)
		}

		// Try to extract JSON
		const jsonStart = message.indexOf('```json')
		const jsonEnd = message.indexOf('```', jsonStart + '```json'.length)
		if (jsonStart !== -1 && jsonEnd !== -1) {
			jsonResponse = message.slice(jsonStart + '```json'.length, jsonEnd).trim()
		}

		// Try to extract TypeScript
		const tsStart = message.indexOf('```typescript')
		const tsEnd = message.indexOf('```', tsStart + '```typescript'.length)
		if (tsStart !== -1 && tsEnd !== -1) {
			tsResponse = message.slice(tsStart + '```typescript'.length, tsEnd).trim()
		}

		// Determine which response to use
		let finalResponse = html || jsonResponse || tsResponse

		if (!finalResponse) {
			console.warn('No valid response format found in the message.')
			throw Error('Could not parse the response.')
		}

		// Update the shape with the new props
		// editor.updateShape<PreviewShape>({
		// 	id: newShapeId,
		// 	type: 'response',
		// 	props: {
		// 		html: finalResponse,
		// 	},
		// })

		// // Extract JSON from the response
		// const message = json.choices[0].message.content
		// const start = message.indexOf('```json')
		// const end = message.indexOf('```', start + '```json'.length)
		// const jsonResponse = message.slice(start, end)

		// // Update the shape with the new props
		// editor.updateShape<PreviewShape>({
		// 	id: newShapeId,
		// 	type: 'response',
		// 	props: {
		// 		html,
		// 	},
		// })

		console.log(`Response: ${message}`)

		return finalResponse
	} catch (e) {
		// If anything went wrong, delete the shape.
		// editor.deleteShape(newShapeId)
		throw e
	}
}
