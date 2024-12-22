import { useEffect, useState } from "react"
import { App } from "./App"
import { http } from "../utilities/Http"
import { Round, DynamicWebappConfig, dynamicWebappConfigZod, zodValidate } from "common"
import { getRound } from "../utilities/Rounds"

export function AppBeforeLoad() {
	const [config, setConfig] = useState<DynamicWebappConfig | undefined>(undefined)
	const [round, setRound] = useState<Round | undefined>(undefined)
	useEffect(() => {
		(async () => {
			setConfig(zodValidate(dynamicWebappConfigZod, await http("/config.json")))
		})()
	}, [])
	useEffect(() => {
		if (config !== undefined) {
			(async () => {
				setRound(await getRound(config))
			})()
		}
	}, [config])

	if (config !== undefined && round !== undefined) {
		return <App config={config} originalRound={round}/>
	} else {
		return null
	}
}