const { blockToString } = require("../block-to-string")

const EOL_MD = "\n\n"

exports.getNotionPageMD = (page) =>
	page.children.reduce((acc, block) => {
		let childBlocksString = ""

		if (block.has_children) {
			childBlocksString = "<div notion-nested>"
				.concat(childBlocksString)
				.concat(this.getNotionPageMD(block))
				.concat("</div>")
				.concat(EOL_MD)
		}

		if (block.type == "paragraph") {
			return acc.concat(blockToString(block.paragraph.text)).concat(EOL_MD).concat(childBlocksString)
		}

		if (block.type.startsWith("heading_")) {
			const headingLevel = Number(block.type.split("_")[1])

			return acc
				.concat("#".repeat(headingLevel))
				.concat(" ")
				.concat(blockToString(block[block.type].text))
				.concat(EOL_MD)
				.concat(childBlocksString)
		}

		if (block.type == "to_do") {
			return acc
				.concat(`- [${block.to_do.checked ? "x" : " "}] `)
				.concat(blockToString(block.to_do.text))
				.concat(EOL_MD)
				.concat(childBlocksString)
		}

		if (block.type == "bulleted_list_item") {
			return acc
				.concat("* ")
				.concat(blockToString(block.bulleted_list_item.text))
				.concat(EOL_MD)
				.concat(childBlocksString)
		}

		if (block.type == "numbered_list_item") {
			return acc
				.concat("1. ")
				.concat(blockToString(block.numbered_list_item.text))
				.concat(EOL_MD)
				.concat(childBlocksString)
		}

		if (block.type == "toggle") {
			return acc
				.concat("<details><summary>")
				.concat(blockToString(block.toggle.text))
				.concat("</summary>")
				.concat(childBlocksString)
				.concat("</details>")
		}

		if (block.type == "unsupported") {
			return acc
				.concat(`<!-- This block is not supported by Notion API yet. -->`)
				.concat(EOL_MD)
				.concat(childBlocksString)
		}

		return acc
	}, "")
