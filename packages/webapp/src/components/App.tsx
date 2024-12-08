import { useRef, useState } from "react"
import { BACKGROUND_SHADE_T1 } from "../utilities/Constants"
import { AssociationsGameRound, DynamicWebappConfig } from "common"
import { useWindowSize } from "../hooks/useWindowSize"
import { shuffle } from "lodash"

interface Props {
	config: DynamicWebappConfig,
	round: AssociationsGameRound
}

export function App(props: Props) {
	useWindowSize()
	const gridElement = useRef<HTMLDivElement>(null)
	const [words, setWords] = useState<Array<string>>(shuffle(props.round.categories.flatMap(category => category.words)))
	const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set())
	const [finishedCategories, setFinishedCategories] = useState<Array<string>>([])

	function onClickWord(word: string) {
		const newSelectedWords = new Set(selectedWords)
		if (newSelectedWords.has(word)) {
			newSelectedWords.delete(word)
		} else {
			newSelectedWords.add(word)
		}
		setSelectedWords(newSelectedWords)
	}

	return <div style={{display: "flex", flexDirection: "column", alignItems: "center", padding: 20, gap: 20}}>
		<div style={{fontSize: "large"}}>Associations Game</div>
		<div ref={gridElement} style={{display: "grid", width: "50vw", height: "50vh",
			gridTemplateColumns: `repeat(${4}, minmax(0, 1fr))`,
			gridTemplateRows: `repeat(${4}, minmax(0, 1fr))`
		}} onContextMenu={e => e.preventDefault()}>
			{
				words.map((word, index) => {
					return <div key={word} style={{
						gridColumn: (index % 4)+1,
						gridRow: (Math.floor(index / 4))+1,
						backgroundColor: BACKGROUND_SHADE_T1,
						borderRadius: 4,
						margin: 5,
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						borderStyle: selectedWords.has(word) ? "solid" : "none",
						borderColor: "white",
						borderWidth: 2,
						userSelect: "none"
					}} onMouseDown={() => onClickWord(word)}>
						{word}
					</div>
				})
			}
		</div>
	</div>
}