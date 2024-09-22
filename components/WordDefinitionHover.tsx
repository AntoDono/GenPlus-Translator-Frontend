import '../app/globals.css'

interface WordDefinitionHoverProp {
    text: string,
    hover_text: string
}

export default function WordDefinitionHover(props: WordDefinitionHoverProp) {
    return (
        <span className="group relative hover: cursor-pointer">
            {props.text}
            <p className="invisible absolute bottom-[125%] left-0 w-max break-words
            group-hover:visible bg-slate-600 text-white p-1 rounded-md">{props.hover_text}</p>
        </span>
    )
}