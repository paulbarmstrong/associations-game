import { OptimusDdbClient } from "optimus-ddb-client"
import { ClientError, translateForHttp } from "./utilities/Http"
import { getRound } from "./handlers/get-round"

const optimus: OptimusDdbClient = new OptimusDdbClient()

export const handler = translateForHttp(async (event) => {
	if (event.path === "/get-round") return await getRound(event, optimus)
	throw new ClientError("Bad request.")
})
