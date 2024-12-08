import { useRef, useState } from "react"
import { BACKGROUND_SHADE_T1 } from "../utilities/Constants"
import { Category, DynamicWebappConfig, Round } from "common"
import { useWindowSize } from "../hooks/useWindowSize"
import { isEqual, shuffle } from "lodash"
import { getCategoryColor } from "../utilities/Color"

interface Props {
	config: DynamicWebappConfig,
	round: Round
}

export function App(props: Props) {
	useWindowSize()
	const gridElement = useRef<HTMLDivElement>(null)
	const [words, setWords] = useState<Array<string>>(shuffle(props.round.categories.flatMap(category => category.words)))
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

	function onClickSubmit() {
		if (selectedWords.size !== 4) return
		const category = props.round.categories
			.find(category => isEqual(Array.from(selectedWords).sort(), [...category.words].sort()))
		if (category === undefined) {
			setTriedCombinations([...triedCombinations, selectedWords])
		} else {
			setWords(words.filter(word => !selectedWords.has(word)))
			setSelectedWords(new Set())
			setFinishedCategories([...finishedCategories, category])
		}
	}

	const gridItemStyle = {
		backgroundColor: BACKGROUND_SHADE_T1,
		borderRadius: 4,
		margin: 5,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		userSelect: "none" as "none"
	}

	const isComboTried = triedCombinations.find(combination => isEqual(Array.from(selectedWords).sort(), Array.from(combination).sort())) !== undefined

	return <div style={{display: "flex", flexDirection: "column", alignItems: "center", padding: 20, gap: 5}}>
		<div style={{fontSize: "x-large", padding: 20}}>Associations Game</div>
		<div ref={gridElement} style={{display: "grid", width: "50vw", height: "50vh",
			gridTemplateColumns: `repeat(${4}, minmax(0, 1fr))`,
			gridTemplateRows: `repeat(${4+1}, minmax(0, 1fr))`
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
					cursor: selectedWords.size === 4 && !isComboTried ? "pointer" : undefined,
					color: selectedWords.size === 4 && !isComboTried ? undefined : "grey",
				}} onClick={onClickSubmit}>{
					selectedWords.size === 4 ? (isComboTried ? "ALREADY TRIED" : "SUBMIT") : `${selectedWords.size}/4 WORDS SELECTED`
				}</div>
			}
		</div>
	</div>
}