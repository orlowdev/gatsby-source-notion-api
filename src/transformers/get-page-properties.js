const { blockToString } = require("../block-to-string")

exports.getNotionPageProperties = (page) =>
	Object.keys(page.properties).reduce((acc, key) => {
		if (page.properties[key].type == "title") {
			return acc
		}

		if (page.properties[key].type == "rich_text") {
			page.properties[key].rich_text = blockToString(page.properties[key].rich_text)
		}

		return {
			...acc,
			[key]: {
				id: page.properties[key].id,
				key,
				value: page.properties[key][page.properties[key].type],
				type: page.properties[key].type,
			},
		}
	}, {})
