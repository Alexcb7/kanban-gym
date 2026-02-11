import type { BoardState, ColumnId } from "@/app/types"

export function columnDroppableId(col: ColumnId) {
  return `column:${col}` as const
}

export function isColumnDroppableId(id: string): id is `column:${ColumnId}` {
  return id.startsWith("column:")
}

export function getColumnFromDroppableId(id: `column:${ColumnId}`): ColumnId {
  return id.replace("column:", "") as ColumnId
}

export function findColumnByTaskId(state: BoardState, taskId: string): ColumnId | null {
  const cols: ColumnId[] = ["todo", "doing", "done"]
  for (const c of cols) {
    if (state.columns[c].includes(taskId)) return c
  }
  return null
}
