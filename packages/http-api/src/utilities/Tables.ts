import { associationsGameRoundShape } from "common"
import { Table } from "optimus-ddb-client"

export const associationsGameRoundsTable = new Table({
	tableName: "AssociationsGameRounds",
	itemShape: associationsGameRoundShape,
	partitionKey: "partition",
	sortKey: "id"
})
