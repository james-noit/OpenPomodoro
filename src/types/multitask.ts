export interface MultitaskCard {
  id: string
  taskId: string | null
  createdAt: number
}

export type AdvanceProgress = 'stalled' | 'moving' | 'moving-fast'

export interface AdvanceRecord {
  cardId: string
  taskId: string
  phaseEndedAt: number
  progress: AdvanceProgress
  recordedAt: number
}
