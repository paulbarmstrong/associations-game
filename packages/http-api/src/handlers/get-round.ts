import { OptimusDdbClient } from "optimus-ddb-client"
import { HttpApiEvent } from "../utilities/Http"
import { GetRoundResponse } from "common"
import { associationsGameRoundsTable } from "../utilities/Tables"
import { ulid } from "ulid"

export async function getRound(event: HttpApiEvent, optimus: OptimusDdbClient): Promise<GetRoundResponse> {
	const [rounds] = await optimus.queryItems({
		index: associationsGameRoundsTable,
		partitionKeyCondition: ["partition", "=", 0],
		limit: 1
	})

	if (rounds.length > 0 && !rounds[0].completed) {
		return { round: rounds[0] }
	} else {
		const round = optimus.draftItem({
			table: associationsGameRoundsTable,
			item: {
				partition: 0,
				id: ulid(),
				completed: false,
				categories: [
					{ name: "Space travel", words: ["Vacuum", "Celestial", "Orbital", "Navigation"] },
					{ name: "AI ethics", words: ["Algorithm", "Surveillance", "Transparency", "Discrimination"] },
					{ name: "Climate change", words: ["Carbon", "Thermometer", "Permafrost", "Photosynthesis"] },
					{ name: "Health care", words: ["Biometrics", "Epidemiology", "Microbiome", "Telemedicine"] },
				]
			}
		})
		await optimus.commitItems({ items: [round] })
		return { round }
	}
}