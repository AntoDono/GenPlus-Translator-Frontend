'use client'
import '../app/globals.css'
import CyanButton from '../components/CyanButton'
import Head from "next/head"
import { useRouter } from 'next/navigation'

export default function index() {
  const router = useRouter()

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center gap-y-10
    bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <Head>
        <title>Gen+ Translator 🧠🚽</title>
      </Head>
      <h1 className="text-center text-[7vmin] font-[Rubik] font-black text-white">Gen+ Translator 🧠🚽</h1>
      <h2 className="text-[2vmin] text-[Montserrat] text-white">World's first bi-directional brainrot translator</h2>
      <CyanButton text="Try Now" onClick={()=>router.push('/translate')}/>
    </div>
  );
}

