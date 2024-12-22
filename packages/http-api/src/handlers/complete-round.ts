import { OptimusDdbClient } from "optimus-ddb-client"
import { ClientError, HttpApiEvent } from "../utilities/Http"
import { roundsTable } from "../utilities/Tables"
import { completeRoundBodyZod, zodValidate } from "common"

export async function completeRound(event: HttpApiEvent, optimus: OptimusDdbClient) {
	const body = zodValidate(completeRoundBodyZod, event.body, e => new ClientError(e.message))
	const round = await optimus.getItem({
		table: roundsTable,
		key: { partition: 0, id: body.id },
		itemNotFoundErrorOverride: _ => new ClientError(`Round ${body.id} not found.`, 404)
	})
	round.completed = true
	await optimus.commitItems({ items: [round] })
	return {}
}