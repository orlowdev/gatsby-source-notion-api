const { pipeExtend } = require("or-pipets")

const pick = (key) => (obj) => obj[key]

const ifTrue = (predicate, transformer, orElse) => (data) =>
	predicate(data) ? transformer(data) : orElse(data)

const id = (x) => x

const annotateEquation = ifTrue(
	pick("equation"),
	({ content }) => ({ content: `$${content}$` }),
	id,
)
const annotateBold = ifTrue(pick("bold"), ({ content }) => ({ content: `**${content}**` }), id)
const annotateItalic = ifTrue(pick("italic"), ({ content }) => ({ content: `_${content}_` }), id)
const annotateCode = ifTrue(pick("code"), ({ content }) => ({ content: `\`${content}\`` }), id)
const annotateStrikethrough = ifTrue(
	pick("strikethrough"),
	({ content }) => ({ content: `~~${content}~~` }),
	id,
)
const annotateUnderline = ifTrue(
	pick("underline"),
	({ content }) => ({ content: `<u>${content}</u>` }),
	id,
)
const annotateColor = ifTrue(
	({ color }) => color != "default",
	({ content, color }) => ({ content: `<span notion-color="${color}">${content}</span>` }),
	id,
)
const annotateLink = ifTrue(
	pick("link"),
	({ content, link }) => ({ content: `[${content}](${link.url ? link.url : link})` }),
	id,
)

const stylize = pipeExtend(annotateBold)
	.pipeExtend(annotateItalic)
	.pipeExtend(annotateCode)
	.pipeExtend(annotateStrikethrough)
	.pipeExtend(annotateUnderline)
	.pipeExtend(annotateColor)
	.pipeExtend(annotateLink)
	.pipeExtend(annotateEquation)

exports.blockToString = (textBlocks) =>
	textBlocks.reduce((text, textBlock) => {
		const data = {
			...textBlock.text,
			...textBlock.annotations,
		}

		if (textBlock.type == "equation") {
			data.content = textBlock.equation.expression
			data.equation = true
		}

		if (textBlock.type == "mention") {
			if (textBlock.mention.type == "user") {
				data.content = textBlock.plain_text
			}

			if (textBlock.mention.type == "date") {
				if (textBlock.mention.date.end) {
					data.content = `${textBlock.mention.date.start} → ${textBlock.mention.date.start}`
				} else {
					data.content = textBlock.mention.date.start
				}

				data.content = `<time datetime="${data.content}">${data.content}</time>`
			}

			if (textBlock.mention.type == "page") {
				data.content = textBlock.plain_text
			}
		}

		return text.concat(stylize.process(data).content)
	}, "")
