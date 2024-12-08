import { ShapeToType } from "shape-tape"
import { associationsGameRoundShape, dynamicWebappConfigShape, getRoundResponseShape } from "./Shapes"

export type Json = undefined | null | string | number | boolean | Array<Json> | JsonObject

export type JsonObject = {
	[name: string]: Json
}

export type AssociationsGameRound = ShapeToType<typeof associationsGameRoundShape>

export type GetRoundResponse = ShapeToType<typeof getRoundResponseShape>

export type DynamicWebappConfig = ShapeToType<typeof dynamicWebappConfigShape>