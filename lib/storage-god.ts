const KEY = "kanban_god_mode_v1"

export function loadGodMode(): boolean {
  if (typeof window === "undefined") return false
  return window.localStorage.getItem(KEY) === "1"
}

export function saveGodMode(v: boolean) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(KEY, v ? "1" : "0")
}
