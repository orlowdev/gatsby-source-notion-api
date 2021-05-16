const { getPages } = require("./notion")

const NODE_TYPE = "Notion"

exports.sourceNodes = async (
	{ actions, createContentDigest, createNodeId, reporter },
	pluginOptions,
) => {
	const { createNode } = actions

	const data = {
		pages: await getPages(pluginOptions, reporter),
	}

	data.pages.forEach((page) => {
		const properties = Object.keys(page.properties).reduce((acc, key) => {
			if (page.properties[key].type == "title") {
				return acc
			}

			return {
				...acc,
				[key]: {
					key,
					value: page.properties[key][page.properties[key].type],
					type: page.properties[key].type,
				},
			}
		}, {})

		const titleProperty = Object.keys(page.properties).find(
			(key) => page.properties[key].type == "title",
		)

		const title = page.properties[titleProperty].title.reduce((acc, chunk) => {
			if (chunk.type == "text") {
				return acc.concat(chunk.plain_text)
			}

			if (chunk.type == "mention") {
				if (chunk.mention.type == "user") {
					return acc.concat(chunk.mention.user.name)
				}

				if (chunk.mention.type == "date") {
					if (chunk.mention.date.end) {
						return acc.concat(`${chunk.mention.date.start} → ${chunk.mention.date.start}`)
					}

					return acc.concat(chunk.mention.date.start)
				}

				if (chunk.mention.type == "page") {
					return acc.concat(chunk.plain_text)
				}
			}

			return acc
		}, "")

		createNode({
			id: createNodeId(`${NODE_TYPE}-${page.id}`),
			title: title.trim(),
			properties,
			archived: page.archived,
			createdAt: page.created_time,
			updatedAt: page.last_edited_time,
			raw: page,
			parent: null,
			children: [],
			internal: {
				type: NODE_TYPE,
				content: JSON.stringify(page),
				contentDigest: createContentDigest(page),
			},
		})
	})
}
