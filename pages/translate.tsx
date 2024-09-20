import Head from "next/head"
import '../app/globals.css'
import CyanButton from "@/components/CyanButton"
import React, { useRef, useEffect, useState } from 'react';
import { FetchEventResult } from "next/dist/server/web/types";
import Nav from "@/components/Nav";

export default function translate() {

    const [generateStatus, setGenerateStatus] = useState(false)
    const [serverMessage, setServerMessage] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const inputBox = useRef<HTMLInputElement>(null)
    const outputBox = useRef<HTMLDivElement>(null)
    const translateOptions = useRef<HTMLSelectElement>(null)

    const handleTranslation = async () => {
        if (generateStatus) return
        setGenerateStatus(true)
        setErrorMessage("")
        if (inputBox.current && translateOptions.current) {
            console.log("SENT TRANSLATION")
            let user_input: string = inputBox.current.value
            if (user_input != "") {
                let options = translateOptions.current.value
                setServerMessage("Waiting for server generation...")
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
                outputBox.current!.innerText = data["result"]
            }else{
                setErrorMessage("Please enter a value in the textbox")
            }
        }
        setServerMessage("")
        setGenerateStatus(false)
    }

    return (
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-screen">
            <Nav />
            <Head>
                <title>Gen+ Translator 🧠🚽</title>
            </Head>
            <div className="flex justify-center flex-col items-center pt-20 gap-y-10">
                <div className="text-xl font-[Rubik] flex flex-row gap-x-2">
                    <div className="w-full max-w-sm min-w-[200px]">
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
                    <CyanButton text="Translate 🚽" onClick={handleTranslation} />
                    <p className="text-lg text-green-700 font-bold">{serverMessage}</p>
                    <p className="text-lg text-red-800 font-bold">{errorMessage}</p>
                </div>
                <div ref={outputBox} className="
                outline-none border-4 border-slate-400 bg-white w-[80%] p-4 rounded-md
                transition-all focus:border-blue-400 text-lg font-[Montserrat]"></div>
            </div>
        </div>
    )
}
