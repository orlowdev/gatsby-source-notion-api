const fetch = require("node-fetch")
const { errorMessage } = require("../error-message")

exports.getBlocks = async ({ id, page, notionVersion, token }, reporter) => {
	let hasMore = true
	let pageContent = []
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
				.then((res) => {
					pageContent = pageContent.concat(res.results)
					startCursor = res.next_cursor
					hasMore = res.has_more
				})
		} catch (e) {
			reporter.panic(errorMessage)
		}
	}

	page.children = pageContent

	return page
}
