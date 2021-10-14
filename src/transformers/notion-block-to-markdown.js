const { blockToString } = require("../block-to-string")

const EOL_MD = "\n"

exports.notionBlockToMarkdown = (block, lowerTitleLevel, depth = 0) =>
	block.children.reduce((acc, childBlock) => {
		let childBlocksString = ""

		if (childBlock.has_children) {
			childBlocksString = "  "
				.repeat(depth)
				.concat(childBlocksString)
				.concat(this.notionBlockToMarkdown(childBlock, lowerTitleLevel, depth + 2))
				.concat(EOL_MD)
		}

		if (childBlock.type == "paragraph") {
			const p = blockToString(childBlock.paragraph.text)

			const isTableRow = p.startsWith("|") && p.endsWith("|")

			const isCodeSnippetLine =
				block.paragraph &&
				block.paragraph.text &&
				block.paragraph.text[0] &&
				block.paragraph.text[0].plain_text &&
				block.paragraph.text[0].plain_text.startsWith("```")

			return acc
				.concat(p)
				.concat(isTableRow || isCodeSnippetLine ? EOL_MD : EOL_MD.concat(EOL_MD))
				.concat(childBlocksString)
		}

		if (childBlock.type.startsWith("heading_")) {
			const headingLevel = Number(childBlock.type.split("_")[1])

			return acc
				.concat(EOL_MD)
				.concat(lowerTitleLevel ? "#" : "")
				.concat("#".repeat(headingLevel))
				.concat(" ")
				.concat(blockToString(childBlock[childBlock.type].text))
				.concat(EOL_MD)
				.concat(childBlocksString)
		}

		if (childBlock.type == "to_do") {
			return acc
				.concat(`- [${childBlock.to_do.checked ? "x" : " "}] `)
				.concat(blockToString(childBlock.to_do.text))
				.concat(EOL_MD)
				.concat(childBlocksString)
		}

		if (childBlock.type == "bulleted_list_item") {
			return acc
				.concat("* ")
				.concat(blockToString(childBlock.bulleted_list_item.text))
				.concat(EOL_MD)
				.concat(childBlocksString)
		}

		if (childBlock.type == "numbered_list_item") {
			return acc
				.concat("1. ")
				.concat(blockToString(childBlock.numbered_list_item.text))
				.concat(EOL_MD)
				.concat(childBlocksString)
		}

		if (childBlock.type == "toggle") {
			return acc
				.concat("<details><summary>")
				.concat(blockToString(childBlock.toggle.text))
				.concat("</summary>")
				.concat(childBlocksString)
				.concat("</details>")
		}

		if (childBlock.type == "code") {
			return acc
				.concat("```", childBlock.code.language, EOL_MD)
				.concat(blockToString(childBlock.code.text))
				.concat(EOL_MD)
				.concat("```")
				.concat(childBlocksString)
		}

		if (childBlock.type == "unsupported") {
			return acc
				.concat(`<!-- This block is not supported by Notion API yet. -->`)
				.concat(EOL_MD)
				.concat(childBlocksString)
		}

		return acc
	}, "")
