const { getPages } = require("./src/notion-api/get-pages")
const { notionBlockToMarkdown } = require("./src/transformers/notion-block-to-markdown")
const { getNotionPageProperties } = require("./src/transformers/get-page-properties")
const { getNotionPageTitle } = require("./src/transformers/get-page-title")
const YAML = require("yaml")

const DEFAULT_NOTION_NODE_TYPE = "Notion"

exports.sourceNodes = async (
	{ actions, createContentDigest, createNodeId, reporter, cache },
	{ token, databaseId, nodeTypeName = null, propsToFrontmatter = true, lowerTitleLevel = true },
) => {
	const pages = await getPages({ token, databaseId }, reporter, cache)

	pages.forEach((page) => {
		const title = getNotionPageTitle(page)
		const properties = getNotionPageProperties(page)
		const notionNodeType = nodeTypeName ?? DEFAULT_NOTION_NODE_TYPE;
		let markdown = notionBlockToMarkdown(page, lowerTitleLevel)

		if (propsToFrontmatter) {
			const frontmatter = Object.keys(properties).reduce(
				(acc, key) => ({
					...acc,
					[key]: properties[key].value.remoteImage || properties[key].value,
				}),
				{ title },
			)

			markdown = "---\n".concat(YAML.stringify(frontmatter)).concat("\n---\n\n").concat(markdown)
		}

		actions.createNode({
			id: createNodeId(`${notionNodeType}-${page.id}`),
			title,
			properties,
			archived: page.archived,
			createdAt: page.created_time,
			updatedAt: page.last_edited_time,
			markdownString: markdown,
			raw: page,
			json: JSON.stringify(page),
			parent: null,
			children: [],
			internal: {
				type: notionNodeType,
				mediaType: "text/markdown",
				content: markdown,
				contentDigest: createContentDigest(page),
			},
		})
	})
}
