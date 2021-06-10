const { getPages } = require("./src/notion-api/get-pages")
const { notionBlockToMarkdown } = require("./src/transformers/notion-block-to-markdown")
const { getNotionPageProperties } = require("./src/transformers/get-page-properties")
const { getNotionPageTitle } = require("./src/transformers/get-page-title")
const YAML = require("yaml")

const NOTION_NODE_TYPE = "Notion"

exports.sourceNodes = async (
	{ actions, createContentDigest, createNodeId, reporter },
	{ token, databaseId, propsToFrontmatter = true, lowerTitleLevel = true },
) => {
	const pages = await getPages({ token, databaseId }, reporter)

	pages.forEach((page) => {
		const title = getNotionPageTitle(page)
		const properties = getNotionPageProperties(page)
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
			id: createNodeId(`${NOTION_NODE_TYPE}-${page.id}`),
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
				type: NOTION_NODE_TYPE,
				mediaType: "text/markdown",
				content: markdown,
				contentDigest: createContentDigest(page),
			},
		})
	})
}
