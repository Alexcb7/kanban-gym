import type { BoardState } from "@/app/types"

const STORAGE_KEY = "kanban_state_v1"

export function getDefaultBoardState(): BoardState {
  return {
    tasks: {},
    columns: {
      todo: [],
      doing: [],
      done: [],
    },
  }
}

export function loadBoardState(): BoardState {
  if (typeof window === "undefined") return getDefaultBoardState()

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultBoardState()

    const parsed = JSON.parse(raw) as unknown
    // Validación “light” (en Paso 4 haremos Zod fuerte para import)
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("tasks" in parsed) ||
      !("columns" in parsed)
    ) {
      return getDefaultBoardState()
    }

    return parsed as BoardState
  } catch {
    return getDefaultBoardState()
  }
}

export function saveBoardState(state: BoardState): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
