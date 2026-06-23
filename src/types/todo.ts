export type Priority = 'low' | 'medium' | 'high'

export interface Todo {
  id: string
  title: string
  importance: Priority
  urgency: Priority
  tags: string[]
  done: boolean
  order: number
  createdAt: number
}

export interface TodoExport {
  version: 1
  todos: Todo[]
}
