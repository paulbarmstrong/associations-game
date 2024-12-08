import { s } from "shape-tape"
import { ULID_REGEX } from "../Constants"

export const ulidShape = s.string({pattern: ULID_REGEX()})

export const associationsGameRoundShape = s.object({
	partition: s.literal(0),
	id: ulidShape,
	completed: s.boolean(),
	categories: s.array(s.object({
		name: s.string(),
		words: s.array(s.string())
	}))
})

export const getRoundResponseShape = s.object({
	round: associationsGameRoundShape
})

export const dynamicWebappConfigShape = s.object({
	httpApiEndpoint: s.string()
})