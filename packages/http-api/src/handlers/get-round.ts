import { OptimusDdbClient } from "optimus-ddb-client"
import { HttpApiEvent } from "../utilities/Http"
import { GetRoundResponse } from "common"
import { roundsTable } from "../utilities/Tables"
import { ulid } from "ulid"

export async function getRound(event: HttpApiEvent, optimus: OptimusDdbClient): Promise<GetRoundResponse> {
	const [rounds] = await optimus.queryItems({
		index: roundsTable,
		partitionKeyCondition: ["partition", "=", 0],
		limit: 1
	})

	if (rounds.length > 0 && !rounds[0].completed) {
		return { round: rounds[0] }
	} else {
		const round = optimus.draftItem({
			table: roundsTable,
			item: {
				partition: 0,
				id: ulid(),
				completed: false,
				categories: [
					{ name: "Space travel", hue: 25, words: ["Vacuum", "Celestial", "Orbital", "Navigation"] },
					{ name: "AI ethics", hue: 210, words: ["Algorithm", "Surveillance", "Transparency", "Discrimination"] },
					{ name: "Climate change", hue: 60, words: ["Carbon", "Thermometer", "Permafrost", "Photosynthesis"] },
					{ name: "Health care", hue: 240, words: ["Biometrics", "Epidemiology", "Microbiome", "Telemedicine"] },
				]
			}
		})
		await optimus.commitItems({ items: [round] })
		return { round }
	}
}