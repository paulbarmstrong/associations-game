import { roundShape } from "common"
import { Table } from "optimus-ddb-client"

export const roundsTable = new Table({
	tableName: "AssociationsGameRounds",
	itemShape: roundShape,
	partitionKey: "partition",
	sortKey: "id"
})
