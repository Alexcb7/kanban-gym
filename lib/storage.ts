import type { BoardState } from "@/app/types"

const STORAGE_KEY = "gym-ops-board"

/**
 * Estado inicial vacío
 */
export function getDefaultBoardState(): BoardState {
  return {
    tasks: {},
    columns: {
      todo: [],
      doing: [],
      done: [],
    },
    auditLog: [],
  }
}

/**
 * Cargar desde localStorage
 */
export function loadBoardState(): BoardState {
  if (typeof window === "undefined") {
    return getDefaultBoardState()
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultBoardState()

    return JSON.parse(raw) as BoardState
  } catch (error) {
    console.error("Error cargando board:", error)
    return getDefaultBoardState()
  }
}

/**
 * Guardar en localStorage
 */
export function saveBoardState(state: BoardState): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error("Error guardando board:", error)
  }
}
