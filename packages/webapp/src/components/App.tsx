import { useRef, useState } from "react"
import { MENU_WIDTH } from "../utilities/Constants"
import { Category, DynamicWebappConfig, Round } from "common"
import { useWindowSize } from "../hooks/useWindowSize"
import { isEqual, shuffle } from "lodash"
import { completeRound, getRound } from "../utilities/Rounds"
import { useError } from "../hooks/useError"
import { Toast } from "./Toast"
import { getShade } from "../utilities/Color"
import { LoadingSpinner } from "./LoadingSpinner"

interface Props {
	config: DynamicWebappConfig,
	originalRound: Round
}

export function App(props: Props) {
	useWindowSize()

	const [error, setError, withError] = useError()
	const [loading, setLoading] = useState<boolean>(false)
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
				setLoading(true)
				const newRound = await getRound(props.config)
				setLoading(false)
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
		backgroundColor: getShade(1),
		borderRadius: 4,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		textAlign: "center" as "center",
		userSelect: "none" as "none",
		overflowWrap: "break-word" as "break-word",
		wordWrap: "break-word" as "break-word",
		hyphens: "auto" as "auto"
	}

	const isComboTried = triedCombinations.find(combination => isEqual(Array.from(selectedWords).sort(), Array.from(combination).sort())) !== undefined

	const isSubmitClickable = !loading && (words.length === 0 || (selectedWords.size === 4 && !isComboTried))

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
					return <div key={category.name} style={{
						...gridItemStyle,
						gridColumnStart: 1,
						gridColumnEnd: 5,
						gridRow: (index)+1,
						backgroundColor: getShade(-2),
						flexDirection: "column",
						gap: 5,
						userSelect: undefined
					}}>
						<span style={{fontWeight: "bold"}}>{category.emoji} {category.name}</span>
						<span>{`(${category.words.join(", ")})`}</span>
					</div>
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
			<div style={{
				...gridItemStyle,
				gridColumnStart: 1,
				gridColumnEnd: 5,
				gridRow: 5,
				fontWeight: "bold",
				cursor: isSubmitClickable ? "pointer" : undefined,
				color: isSubmitClickable ? undefined : "grey",
				padding: 10
			}} onClick={isSubmitClickable ? onClickSubmit : undefined}>{
				words.length > 0 ? (
					selectedWords.size === 4 ? (isComboTried ? "ALREADY TRIED" : "SUBMIT") : `${selectedWords.size}/4 WORDS SELECTED`
				) : (
					loading ? <LoadingSpinner/> : "NEXT ROUND"
				)
			}</div>
		</div>
	</div>
}