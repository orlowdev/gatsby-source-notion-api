const fetch = require("node-fetch")
const { errorMessage } = require("../error-message")
const { getBlocks } = require("./get-blocks")

exports.getPages = async ({ token, databaseId, notionVersion = "2021-05-13" }, reporter) => {
	try {
		const db = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
			method: "POST",
			body: JSON.stringify({
				page_size: 100,
			}),
			headers: {
				"Content-Type": "application/json",
				"Notion-Version": notionVersion,
				Authorization: `Bearer ${token}`,
			},
		}).then((res) => res.json())

		for (let page of db.results) {
			page.children = await getBlocks({ id: page.id, block: page, token, notionVersion }, reporter)
		}

		return db.results
	} catch (e) {
		reporter.panic(errorMessage)
	}
}
