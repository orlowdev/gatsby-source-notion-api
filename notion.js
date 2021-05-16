const fetch = require("node-fetch")

const errorMessage = `gatsby-source-notion-api 
			
Could not fetch data from Notion API. Check if "databaseId" and "token" are provided correctly. Make sure the integration using provided token has access to provided database.`

const getPageContent = async ({ page, notionVersion, token }, reporter) => {
	let hasMore = true
	let pageContent = []
	let startCursor = ""

	while (hasMore) {
		let url = `https://api.notion.com/v1/blocks/${page.id}/children`

		if (startCursor) {
			url += `?start_cursor=${startCursor}`
		}

		try {
			await fetch(url, {
				headers: {
					"Content-Type": "application/json",
					"Notion-Version": notionVersion,
					"Authorization": `Bearer ${token}`,
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

	page.page_content = pageContent

	return page
}

const getPages = async ({ token, databaseId, notionVersion = "2021-05-13" }, reporter) => {
	try {
		const db = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
			method: "POST",
			body: JSON.stringify({
				page_size: 100,
			}),
			headers: {
				"Content-Type": "application/json",
				"Notion-Version": notionVersion,
				"Authorization": `Bearer ${token}`,
			},
		}).then((res) => res.json())

		for (let page of db.results) {
			page = await getPageContent({ page, token, notionVersion }, reporter)
		}

		return db.results
	} catch (e) {
		reporter.panic(errorMessage)
	}
}

module.exports = { getPages }
