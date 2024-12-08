import { useRef, useState } from "react"
import { BACKGROUND_SHADE_T1, MENU_WIDTH } from "../utilities/Constants"
import { Category, DynamicWebappConfig, Round } from "common"
import { useWindowSize } from "../hooks/useWindowSize"
import { isEqual, shuffle } from "lodash"
import { getCategoryColor } from "../utilities/Color"
import { completeRound, getRound } from "../utilities/Rounds"
import { useError } from "../hooks/useError"
import { Toast } from "./Toast"

interface Props {
	config: DynamicWebappConfig,
	originalRound: Round
}

export function App(props: Props) {
	useWindowSize()

	const [error, setError, withError] = useError()
	const [round, setRound] = useState<Round>(props.originalRound)
	const gridElement = useRef<HTMLDivElement>(null)
	const [words, setWords] = useState<Array<string>>(shuffle(round.categories.flatMap(category => category.words)))
	const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set())
	const [finishedCategories, setFinishedCategories] = useState<Array<Category>>([])
	const [triedCombinations, setTriedCombinations] = useState<Array<Set<string>>>([])

	function onClickWord(word: string) {
		const newSelectedWords = new Set(selectedWords)
		if (newSelectedWords.has(word)) {
			newSelectedWords.delete(word)
		} else {
			newSelectedWords.add(word)
		}
		setSelectedWords(newSelectedWords)
	}

	async function onClickSubmit() {
		await withError(async () => {
			if (words.length === 0) {
				const newRound = await getRound(props.config)
				setRound(newRound)
				setWords(shuffle(newRound.categories.flatMap(category => category.words)))
				setSelectedWords(new Set())
				setFinishedCategories([])
				setTriedCombinations([])
				return
			}
			if (selectedWords.size !== 4) return
			const category = round.categories
				.find(category => isEqual(Array.from(selectedWords).sort(), [...category.words].sort()))
			if (category === undefined) {
				setTriedCombinations([...triedCombinations, selectedWords])
			} else {
				const newWords = words.filter(word => !selectedWords.has(word))
				setWords(newWords)
				setSelectedWords(new Set())
				setFinishedCategories([...finishedCategories, category])
				if (newWords.length === 0) {
					await completeRound(props.config, round.id)
				}
			}
		})
	}

	const gridItemStyle = {
		backgroundColor: BACKGROUND_SHADE_T1,
		borderRadius: 4,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		userSelect: "none" as "none"
	}

	const isComboTried = triedCombinations.find(combination => isEqual(Array.from(selectedWords).sort(), Array.from(combination).sort())) !== undefined

	return <div style={{display: "flex", flexDirection: "column", alignItems: "center", padding: 20, gap: 20}}>
		<div style={{fontSize: "x-large"}}>Associations Game</div>
		{
			error !== undefined ? (
				<Toast message={error.message} onClose={() => setError(undefined)}/>
			) : (
				undefined
			)
		}
		<div ref={gridElement} style={{display: "grid", width: MENU_WIDTH, height: "50vh",
			gridTemplateColumns: `repeat(${4}, minmax(0, 1fr))`,
			gridTemplateRows: `repeat(${4+1}, minmax(0, 1fr))`,
			gap: 10
		}} onContextMenu={e => e.preventDefault()}>
			{
				finishedCategories.map((category, index) => {
					return <div style={{
						...gridItemStyle,
						gridColumnStart: 1,
						gridColumnEnd: 5,
						gridRow: (index)+1,
						backgroundColor: getCategoryColor(category)
					}}>{
						`${category.name}`
					}</div>
				})
			}
			{
				words.map((word, index) => {
					return <div key={word} style={{
						...gridItemStyle,
						gridColumn: (index % 4)+1,
						gridRow: (Math.floor(index / 4) + finishedCategories.length)+1,
						borderStyle: selectedWords.has(word) ? "solid" : "none",
						borderColor: "white",
						borderWidth: 2,
						cursor: "pointer"
					}} onMouseDown={() => onClickWord(word)}>
						{word}
					</div>
				})
			}
			{
				<div style={{
					...gridItemStyle,
					gridColumnStart: 1,
					gridColumnEnd: 5,
					gridRow: 5,
					fontWeight: "bold",
					cursor: words.length === 0 || (selectedWords.size === 4 && !isComboTried) ? "pointer" : undefined,
					color: words.length === 0 || (selectedWords.size === 4 && !isComboTried) ? undefined : "grey",
				}} onClick={onClickSubmit}>{
					words.length > 0 ? (
						selectedWords.size === 4 ? (isComboTried ? "ALREADY TRIED" : "SUBMIT") : `${selectedWords.size}/4 WORDS SELECTED`
					) : (
						"NEXT ROUND"
					)
				}</div>
			}
		</div>
	</div>
}