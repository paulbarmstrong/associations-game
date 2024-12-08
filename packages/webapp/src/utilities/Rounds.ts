import { validateDataShape } from "shape-tape"
import { http } from "./Http"
import { DynamicWebappConfig, getRoundResponseShape, Round } from "common"

export async function getRound(config: DynamicWebappConfig): Promise<Round> {
	return validateDataShape({
		data: await http(`${config.httpApiEndpoint}/get-round`),
		shape: getRoundResponseShape
	}).round
}

export async function completeRound(config: DynamicWebappConfig, id: string): Promise<void> {
	await http(`${config.httpApiEndpoint}/complete-round`, { method: "POST", body: JSON.stringify({ id }) })
}