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

	data.pages.forEach((page) =>
		createNode({
			id: createNodeId(`${NODE_TYPE}-${page.id}`),
			raw: page,
			parent: null,
			children: [],
			internal: {
				type: NODE_TYPE,
				content: JSON.stringify(page),
				contentDigest: createContentDigest(page),
			},
		}),
	)
}
