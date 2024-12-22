import { http } from "./Http"
import { DynamicWebappConfig, Round, zodValidate, getRoundResponseZod } from "common"

export async function getRound(config: DynamicWebappConfig): Promise<Round> {
	return zodValidate(getRoundResponseZod, await http(`${config.httpApiEndpoint}/get-round`)).round
}

export async function completeRound(config: DynamicWebappConfig, id: string): Promise<void> {
	await http(`${config.httpApiEndpoint}/complete-round`, { method: "POST", body: JSON.stringify({ id }) })
}