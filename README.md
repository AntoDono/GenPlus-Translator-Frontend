# Gen+ Translator 🧠🚽
World's first bi-drectional brainrot translator.<br>

<i>Youwei Zhen 2024</i>

[Live Production Site](https://brainrot.youweizhen.com/)

## Woah! View the complete Gen+ Translator Repos
- [LLM + Finetuning](https://github.com/AntoDono/GenPlus-Translator)
- [Frontend](https://github.com/AntoDono/GenPlus-Translator-Frontend)
- [Backend](https://github.com/AntoDono/GenPlus-Translator-Backend)

## Frontend
This is the frontend part of Gen+ Translator, built with Next.js 15 (App Router), React 19 and Tailwind. It is a single page: the two-way translator, footnoted definitions for the slang it finds, and a searchable lexicon of every term the model knows.

## Setup

1. Install dependencies:
```bash
npm i
```
2. Point the app at the backend (copy `.env.example` to `.env.local`):
```.env
NEXT_PUBLIC_API_URL="https://genplus.antodono.com"
```
3. Run the dev server:
```bash
npm run dev
```
4. Type-check and build:
```bash
npm run lint
npm run build
```

The backend must expose `GET /vocabulary`, `POST /translate` and `POST /define` (see the backend README).
