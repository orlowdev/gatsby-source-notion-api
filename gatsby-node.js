const { getPages } = require("./src/notion-api/get-pages")
const { getNotionPageMD } = require("./src/transformers/get-page-md")
const { getNotionPageProperties } = require("./src/transformers/get-page-properties")
const { getNotionPageTitle } = require("./src/transformers/get-page-title")
const YAML = require("yaml")

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
		const title = getNotionPageTitle(page)
		const properties = getNotionPageProperties(page)
		const frontmatter = Object.keys(properties).reduce(
			(acc, key) => ({
				...acc,
				[key]: properties[key].value,
			}),
			{ title },
		)
		const markdown = "---\n"
			.concat(YAML.stringify(frontmatter))
			.concat("\n---\n\n")
			.concat(getNotionPageMD(page))

		actions.createNode({
			id: createNodeId(`${NODE_TYPE}-${page.id}`),
			title,
			properties,
			archived: page.archived,
			createdAt: page.created_time,
			updatedAt: page.last_edited_time,
			markdownString: markdown,
			raw: page,
			parent: null,
			children: [],
			internal: {
				type: NODE_TYPE,
				mediaType: "text/markdown",
				content: markdown,
				contentDigest: createContentDigest(page),
			},
		})
	})
}
