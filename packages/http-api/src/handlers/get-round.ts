import { OptimusDdbClient } from "optimus-ddb-client"
import { HttpApiEvent } from "../utilities/Http"
import { categoryShape, GetRoundResponse, Round } from "common"
import { roundsTable } from "../utilities/Tables"
import { ulid } from "ulid"
import { s, validateDataShape } from "shape-tape"
import { askNova } from "../utilities/Nova"

export async function getRound(event: HttpApiEvent, optimus: OptimusDdbClient): Promise<GetRoundResponse> {
	const [rounds] = await optimus.queryItems({
		index: roundsTable,
		partitionKeyCondition: ["partition", "=", 0],
		limit: 1,
		scanIndexForward: false
	})

	if (rounds.length > 0 && !rounds[0].completed) {
		return { round: rounds[0] }
	} else {
		const round = optimus.draftItem({
			table: roundsTable,
			item: await generateNewRound(optimus)
		})
		await optimus.commitItems({ items: [round] })
		return { round }
	}
}

async function generateNewRound(optimus: OptimusDdbClient): Promise<Round> {
	const [previousRounds] = await optimus.queryItems({
		index: roundsTable,
		partitionKeyCondition: ["partition", "=", 0],
		limit: 10,
		scanIndexForward: false
	})
	const previousCategories = previousRounds.flatMap(round => round.categories.flatMap(category => category.name))
	const response = await askNova(`Please choose four random categories that are not in this list:\n${JSON.stringify(previousCategories)}\nCategories should be Please choose words that really only fit into their topic. Please provide the topics as a JSON array of objects, where objects have the topic name 'name', a suitable HSV hue number value 'hue', and four random words related to the topic 'words'. Please dont include anything else in your response.`)
	const categories = validateDataShape({ data: JSON.parse(response), shape: s.array(categoryShape) })
	categories.forEach(category => category.words = category.words.map(word => word.toLowerCase()))
	return {
		partition: 0,
		id: ulid(),
		completed: false,
		categories: categories
	}
}