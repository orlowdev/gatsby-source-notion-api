exports.getNotionPageTitle = (page) => {
	const titleProperty = Object.keys(page.properties).find(
		(key) => page.properties[key].type == "title",
	)

	return page.properties[titleProperty].title
		.reduce((acc, chunk) => {
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
		.trim()
}
