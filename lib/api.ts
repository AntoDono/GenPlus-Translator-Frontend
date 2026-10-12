export type Direction = "en-to-slang" | "slang-to-en";

export interface TermSpan {
  word: string;
  definition: string | null;
  side: "input" | "output";
  start: number;
  end: number;
}

export interface TranslateResult {
  translation: string;
  terms: TermSpan[];
}

export interface VocabTerm {
  word: string;
  definition: string;
}

export interface DefineResult {
  word: string;
  definition: string | null;
  explanation: string;
}

export const MAX_INPUT = 500;

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError(
      "The model server didn't respond. Try again in a few seconds.",
    );
  }

  if (res.ok) return (await res.json()) as T;

  if (res.status === 503 || res.status === 502 || res.status === 504) {
    throw new ApiError(
      "The model server didn't respond. Try again in a few seconds.",
    );
  }
  if (res.status === 429) {
    throw new ApiError("Too many requests. Wait a moment, then try again.");
  }

  let message: string | undefined;
  try {
    const body = await res.json();
    message = body?.error?.message;
  } catch {
    // body was not JSON
  }
  throw new ApiError(message ?? `The request failed (HTTP ${res.status}).`);
}

export function translate(direction: Direction, text: string) {
  return request<TranslateResult>("/translate", {
    method: "POST",
    body: JSON.stringify({ direction, text }),
  });
}

export function fetchVocabulary() {
  return request<{ terms: VocabTerm[] }>("/vocabulary");
}

export function define(word: string) {
  return request<DefineResult>("/define", {
    method: "POST",
    body: JSON.stringify({ word }),
  });
}
