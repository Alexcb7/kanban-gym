import type { BoardState } from "@/app/types"

const STORAGE_KEY = "kanban_state_v1"

export function getDefaultBoardState(): BoardState {
  return {
    tasks: {},
    columns: { todo: [], doing: [], done: [] },
    auditLog: [],
  }
}

export function loadBoardState(): BoardState {
  if (typeof window === "undefined") return getDefaultBoardState()

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultBoardState()

    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== "object") return getDefaultBoardState()

    // fallback seguro si faltan campos
    const p = parsed as Partial<BoardState>
    return {
      tasks: p.tasks ?? {},
      columns: p.columns ?? { todo: [], doing: [], done: [] },
      auditLog: p.auditLog ?? [],
    }
  } catch {
    return getDefaultBoardState()
  }
}

export function saveBoardState(state: BoardState): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
