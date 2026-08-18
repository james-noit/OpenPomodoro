export type AccomplishmentMark = 'red' | 'green'

export interface MultitaskCard {
  id: string
  taskId: string | null
  createdAt: number
  accomplishments: AccomplishmentMark[]
  lastAnsweredPhaseEndAt: number | null
}
