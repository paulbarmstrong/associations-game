import { useEffect, useState } from "react"
import { App } from "./App"
import { http } from "../utilities/Http"
import { AssociationsGameRound, DynamicWebappConfig, dynamicWebappConfigShape, getRoundResponseShape } from "common"
import { validateDataShape } from "shape-tape"

export function AppBeforeLoad() {
	const [config, setConfig] = useState<DynamicWebappConfig | undefined>(undefined)
	const [round, setRound] = useState<AssociationsGameRound | undefined>(undefined)
	useEffect(() => {
		(async () => {
			setConfig(validateDataShape({
				data: await http("/config.json"),
				shape: dynamicWebappConfigShape
			}))
		})()
	}, [])
	useEffect(() => {
		if (config !== undefined) {
			(async () => {
				const res = validateDataShape({
					data: await http(`${config.httpApiEndpoint}/get-round`),
					shape: getRoundResponseShape
				})
				setRound(res.round)
			})()
		}
	}, [config])

	if (config !== undefined && round !== undefined) {
		return <App config={config} round={round}/>
	} else {
		return null
	}
}