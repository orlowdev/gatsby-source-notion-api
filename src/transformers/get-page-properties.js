exports.getNotionPageProperties = (page) =>
	Object.keys(page.properties).reduce((acc, key) => {
		if (page.properties[key].type == "title") {
			return acc
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
