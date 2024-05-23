import { Tree } from './treeDiff'
import { HTMLToJSON } from 'html-to-json-parser'

export type HTMLNode =
	| string
	| {
			type: string
			attributes: Record<string, string>
			content: string | HTMLNode[]
	  }

export const convertHTMLToTree = async (
	html: string | Element,
	{ string = false }: { string: boolean } = { string: false }
) => {
	return convertParsedHTMLToTree((await HTMLToJSON(html, string)) as HTMLNode)
}

export const convertParsedHTMLToTree = (parsedHTML: HTMLNode): Tree => {
	// debugger;
	const convertNode = (node: HTMLNode, key: number = 0, path: number[] = []): Tree => {
		if (typeof node === 'string') {
			return {
				key,
				path,
				label: 'text',
				attrs: {},
				text: node,
			}
		}
		const tree: Tree = {
			key,
			path,
			label: node.type?.toLowerCase(),
			attrs: node.attributes ?? {},
			children: [],
		}

		if (node.content) {
			if (Array.isArray(node.content)) {
				tree.children = node.content.map((n: any, i: number) => convertNode(n, i, [...path, key]))
			} else if (typeof node.content === 'string') {
				tree.children.push({
					key: 0,
					path: [...tree.path, tree.children.length],
					label: 'text',
					attrs: {},
					text: node.content,
				})
			}
		}

		return tree
	}

	return convertNode(parsedHTML)
}
