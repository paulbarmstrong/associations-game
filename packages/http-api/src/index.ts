import { OptimusDdbClient } from "optimus-ddb-client"
import { ClientError, translateForHttp } from "./utilities/Http"
import { getRound } from "./handlers/get-round"
import { completeRound } from "./handlers/complete-round"

const optimus: OptimusDdbClient = new OptimusDdbClient()

export const handler = translateForHttp(async (event) => {
	if (event.path === "/get-round") return await getRound(event, optimus)
	if (event.path === "/complete-round") return await completeRound(event, optimus)
	throw new ClientError("Bad request.")
})
