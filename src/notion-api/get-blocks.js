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
			await fetch(url, {
				headers: {
					"Content-Type": "application/json",
					"Notion-Version": notionVersion,
					Authorization: `Bearer ${token}`,
				},
			})
				.then((res) => res.json())
				.then(async (res) => {
					for (let childBlock of res.results) {
						if (childBlock.has_children) {
							childBlock[childBlock.type].children = await this.getBlocks(
								{ id: block.id, block: childBlock, notionVersion, token },
								reporter,
							)
						}
					}

					blockContent = blockContent.concat(res.results)
					startCursor = res.next_cursor
					hasMore = res.has_more
				})
		} catch (e) {
			reporter.panic(errorMessage)
		}
	}

	return blockContent
}
