import { OptimusDdbClient } from "optimus-ddb-client"
import { HttpApiEvent } from "../utilities/Http"
import { Category, categoryShape, GetRoundResponse, Round } from "common"
import { roundsTable } from "../utilities/Tables"
import { ulid } from "ulid"
import { s, validateDataShape } from "shape-tape"
import { askNova } from "../utilities/Nova"
import { capitalize, shuffle, take } from "lodash"

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

	const totalNumCategories = 4
	const numPhaseCategories = Math.floor(Math.random() * 2) + 1
	const numRegularCategories = totalNumCategories - numPhaseCategories
	const [regularCategoriesResponse, phraseCategoriesResponse] = await Promise.all([
		await askNova(`Please choose ${numRegularCategories} random categories or topics that are not in ${JSON.stringify(previousCategories)}. Please choose words that really only fit into their topic. Please provide the topics as a JSON array of objects, where objects have the topic name 'name', the most closely related emoji 'emoji', and four random words related to the topic 'words'. Please dont include anything else in your response.`),
		await askNova(`Please think of ${numPhaseCategories} keywords, where each keyword is a single word that has four two-word phrases that all contain the keyword. Please choose keywords that aren't in ${JSON.stringify(previousCategories)}. Please output it as a JSON array of objects where each object has the keyword 'name', the most closely related emoji 'emoji', and the four two-word-phrases 'phrases'. Please dont include anything else in your response.`)
	])
	const regularCategories = validateDataShape({ data: JSON.parse(regularCategoriesResponse), shape: s.array(categoryShape) })
	const phraseCategories = validateDataShape({
		data: JSON.parse(phraseCategoriesResponse),
		shape: s.array(s.object({ name: s.string(), emoji: s.string(), phrases: s.array(s.string()) }))
	})

	const categories: Array<Category> = take(shuffle([...regularCategories, ...phraseCategories.map(category => ({
		name: `Phrases with "${category.name}"`,
		emoji: category.emoji,
		words: category.phrases.map(phrase => {
			const match = phrase.split(" ").map(word => word.toLowerCase()).find(word => word !== category.name.toLowerCase())
			if (match === undefined) throw new Error(`Uncoercable phrase category: ${JSON.stringify(category)}`)
			return match.replaceAll(category.name, "")
		})
	}))]), 4)
	if (categories.length < 4) throw new Error(`Got ${categories.length} categories.`)
	categories.forEach(category => category.name = capitalize(category.name.toLowerCase()))
	categories.forEach(category => category.words = category.words.map(word => word.toLowerCase()))
	const words = categories.flatMap(category => category.words)
	words.forEach(word => {
		if (word.length === 0) throw new Error("Got zero-length word.")
	})
	if (new Set(words).size !== words.length) throw new Error(`Only got ${new Set(words).size} unique words.`)
	return {
		partition: 0,
		id: ulid(),
		completed: false,
		categories: categories
	}
}