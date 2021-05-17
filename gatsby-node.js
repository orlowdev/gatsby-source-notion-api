const { getPages } = require("./src/notion-api/get-pages")
const { getNotionPageMD } = require("./src/transformers/get-page-md")
const { getNotionPageProperties } = require("./src/transformers/get-page-properties")
const { getNotionPageTitle } = require("./src/transformers/get-page-title")

const NODE_TYPE = "Notion"

exports.sourceNodes = async (
	{ actions, createContentDigest, createNodeId, reporter },
	pluginOptions,
) => {
	const pages = await getPages(
		{ token: pluginOptions.token, databaseId: pluginOptions.databaseId },
		reporter,
	)

	pages.forEach((page) => {
		actions.createNode({
			id: createNodeId(`${NODE_TYPE}-${page.id}`),
			title: getNotionPageTitle(page),
			properties: getNotionPageProperties(page),
			archived: page.archived,
			createdAt: page.created_time,
			updatedAt: page.last_edited_time,
			markdown: getNotionPageMD(page),
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
