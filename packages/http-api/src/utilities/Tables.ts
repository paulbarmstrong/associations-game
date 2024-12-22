import { Table } from "optimus-ddb-client"
import { roundZod } from "common"

export const roundsTable = new Table({
	tableName: "AssociationsGameRounds",
	itemSchema: roundZod,
	partitionKey: "partition",
	sortKey: "id"
})
