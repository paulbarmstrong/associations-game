import * as z from "zod"

export const ulidZod = z.string().ulid()

export const categoryZod = z.strictObject({
	name: z.string(),
	emoji: z.string(),
	words: z.array(z.string())
})

export const roundZod = z.strictObject({
	partition: z.literal(0),
	id: ulidZod,
	completed: z.boolean(),
	categories: z.array(categoryZod)
})

export const getRoundResponseZod = z.strictObject({
	round: roundZod
})

export const completeRoundBodyZod = z.strictObject({
	id: ulidZod
})

export const dynamicWebappConfigZod = z.object({
	httpApiEndpoint: z.string()
})

export function zodValidate<T extends z.ZodTypeAny>(schema: T, data: any, errorMapping?: (e: z.ZodError) => Error): z.infer<T> {
	try {
		schema.parse(data)
		return data
	} catch (error) {
		if (error instanceof z.ZodError && errorMapping !== undefined) {
			throw errorMapping(error)
		} else {
			throw error
		}
	}
}