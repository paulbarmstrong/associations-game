import { ShapeToType } from "shape-tape"
import { categoryShape, dynamicWebappConfigShape, getRoundResponseShape, roundShape } from "./Shapes"

export type Json = undefined | null | string | number | boolean | Array<Json> | JsonObject

export type JsonObject = {
	[name: string]: Json
}

export type Category = ShapeToType<typeof categoryShape>

export type Round = ShapeToType<typeof roundShape>

export type GetRoundResponse = ShapeToType<typeof getRoundResponseShape>

export type DynamicWebappConfig = ShapeToType<typeof dynamicWebappConfigShape>