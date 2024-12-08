import { s } from "shape-tape"
import { ULID_REGEX } from "../Constants"

export const ulidShape = s.string({pattern: ULID_REGEX()})

export const categoryShape = s.object({
	name: s.string(),
	emoji: s.string(),
	words: s.array(s.string())
})

export const roundShape = s.object({
	partition: s.literal(0),
	id: ulidShape,
	completed: s.boolean(),
	categories: s.array(categoryShape)
})

export const getRoundResponseShape = s.object({
	round: roundShape
})

export const completeRoundBodyShape = s.object({
	id: ulidShape
})

export const dynamicWebappConfigShape = s.object({
	httpApiEndpoint: s.string()
})