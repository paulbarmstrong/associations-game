import * as z from "zod"
import { categoryZod, completeRoundBodyZod, dynamicWebappConfigZod, getRoundResponseZod, roundZod } from "./Zod"

export type Json = undefined | null | string | number | boolean | Array<Json> | JsonObject

export type JsonObject = {
	[name: string]: Json
}

export type Category = z.infer<typeof categoryZod>

export type Round = z.infer<typeof roundZod>

export type GetRoundResponse = z.infer<typeof getRoundResponseZod>

export type CompleteRoundBody = z.infer<typeof completeRoundBodyZod>

export type DynamicWebappConfig = z.infer<typeof dynamicWebappConfigZod>