const fetch = require("node-fetch")
const { errorMessage } = require("../error-message")

exports.getBlocks = async ({ id, block, notionVersion, token }, reporter) => {
	let hasMore = true
	let blockContent = []
	let startCursor = ""

	while (hasMore) {
		let url = `https://api.notion.com/v1/blocks/${id}/children`

		if (startCursor) {
			url += `?start_cursor=${startCursor}`
		}

		try {
			const result = await fetch(url, {
				headers: {
					"Content-Type": "application/json",
					"Notion-Version": notionVersion,
					Authorization: `Bearer ${token}`,
				},
			}).then((res) => res.json())

			for (let childBlock of result.results) {
				if (childBlock.has_children) {
					childBlock.children = await this.getBlocks(
						{ id: childBlock.id, block: childBlock, notionVersion, token },
						reporter,
					)
				}
			}

			blockContent = blockContent.concat(result.results)
			startCursor = result.next_cursor
			hasMore = result.has_more
		} catch (e) {
			reporter.panic(errorMessage)
		}
	}

	return blockContent
}
