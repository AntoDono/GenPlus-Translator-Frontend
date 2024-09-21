import Head from "next/head"
import '../app/globals.css'
import CyanButton from "@/components/CyanButton"
import React, { useRef, useEffect, useState } from 'react';
import Nav from "@/components/Nav";
import LoadingSpin from "@/components/LoadingSpin";
import WordDefinitionHover from "@/components/WordDefinitionHover";

export default function translate() {

    const [generateStatus, setGenerateStatus] = useState(false)
    const [serverMessage, setServerMessage] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [translationWords, setTranslationWords] = useState<String[]>([])
    const [wordsUsed, setWordsUsed] = useState<Array<String[]>>([])
    const [words, setWords] = useState<Array<String[]>>([])
    const inputBox = useRef<HTMLInputElement>(null)
    const outputBox = useRef<HTMLDivElement>(null)
    const translateOptions = useRef<HTMLSelectElement>(null)

    const handleTranslation = async () => {
        if (generateStatus) return
        setGenerateStatus(true)
        setErrorMessage("")
        if (inputBox.current && translateOptions.current && process.env.API_ENDPOINT) {
            let user_input: string = inputBox.current.value
            if (user_input != "") {
                let options = translateOptions.current.value
                setServerMessage("Translating (this might take a few seconds)...")
                let raw_data: Response = await fetch(process.env.API_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "Translation-Type": options,
                        "User-Input": user_input
                    }),
                })
                let data = await raw_data.json()
                setTranslationWords(data["result"].split(" "))
                setWords(data["words"])
                console.log(data)
                console.log(data["words"])
            } else {
                setErrorMessage("Please enter a value in the textbox")
            }
        }
        setServerMessage("")
        setGenerateStatus(false)
    }

    function normalize_string(s: String) {
        return s.toLowerCase().replace(/[^\w\s]/g, '');
    }

    return (
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-screen">
            <Nav />
            <Head>
                <title>Gen+ Translator 🧠🚽</title>
            </Head>
            <div className="flex justify-center flex-col items-center pt-20 gap-y-10">
                <div className="text-xl font-[Rubik] flex items-center justify-center flex-wrap flex-row gap-x-2 w-full">
                    <label className="font-[Montserrat] w-fit font-bold text-slate-100">Translation Options:</label>
                    <div className="w-fit">
                        <div className="relative">
                            <select ref={translateOptions}
                                className="w-full bg-white placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer">
                                <option value="en-to-slang">English → Gen Alpha, Z, Brainrot</option>
                                <option value="slang-to-en">Gen Alpha, Z, Brainrot → English</option>
                            </select>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.2" stroke="currentColor" className="h-5 w-5 ml-1 absolute top-2.5 right-2.5 text-slate-700">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                            </svg>
                        </div>
                    </div>
                </div>
                <input ref={inputBox} type="text" placeholder="Any text here..." className="
                outline-none border-4 border-slate-400 bg-white w-[80%] p-4 rounded-md
                transition-all focus:border-blue-400 text-lg font-[Montserrat]"/>
                <div className="flex items-center flex-col">
                    {
                        serverMessage == "" ?
                            <CyanButton text="Translate 🤔" onClick={handleTranslation} /> :
                            <div className="flex flex-row gap-x-5">
                                <LoadingSpin />
                                <p className="text-lg text-green-500 font-bold">{serverMessage}</p>
                            </div>
                    }
                    <p className="text-lg text-red-500 font-bold">{errorMessage}</p>
                </div>
                <div ref={outputBox} className="
                outline-none border-4 border-slate-400 bg-white w-[80%] p-4 rounded-md
                transition-all focus:border-blue-400 text-lg font-[Montserrat] flex gap-x-1">
                    {translationWords.map((translated_word, index) => {

                        let lowerWord = translated_word.toLocaleLowerCase()

                        let isIn = false
                        let word_definition = null
                        let word_dictionary = null

                        for (let word_and_def of words) {
                            console.log(word_and_def)
                            let word = word_and_def[0]
                            let wordNormalized = word.trim().toLocaleLowerCase()
                            if (lowerWord == wordNormalized || lowerWord.startsWith(wordNormalized)) {
                                isIn = true
                                word_definition = word_and_def[1]
                                word_dictionary = word_and_def[0]
                                // setWordsUsed([...wordsUsed, word_and_def])
                                break
                            }
                        }

                        return (
                            isIn ? <span className="bg-yellow-200">
                                <WordDefinitionHover text={translated_word}
                                    hover_text={`${word_dictionary}: ${word_definition}`}></WordDefinitionHover>
                            </span> : <span>{translated_word}</span>
                        )
                    })}
                </div>
                <div className="w-full justify-center items-center flex-col">
                    {wordsUsed.map((item, key)=>{
                        return (
                            <div className="flex flex-row gap-x-2">
                                <label className="text-lg font-bold">{item[0]}</label>
                                <p className="text-lg">{item[1]}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
