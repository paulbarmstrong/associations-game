import convert from "color-convert"
import { ACCENT_COLOR_LIGHTNESS, ACCENT_COLOR_SATURATION } from "./Constants"
import { Category } from "common"

export function getCategoryColor(category: Category) {
	return "#"+convert.hsl.hex([category.hue, ACCENT_COLOR_SATURATION, ACCENT_COLOR_LIGHTNESS])
}