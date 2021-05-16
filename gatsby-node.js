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
		const properties = Object.keys(page.properties).reduce(
			(acc, key) =>
				acc.concat([
					{
						key,
						...page.properties[key],
					},
				]),
			[],
		)

		const title = properties.find((property) => property.type == "title").title[0].plain_text

		createNode({
			id: createNodeId(`${NODE_TYPE}-${page.id}`),
			title,
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
