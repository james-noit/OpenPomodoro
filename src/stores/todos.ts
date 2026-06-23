import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useLocalStorage } from '../composables/useLocalStorage'
import type { Priority, Todo, TodoExport } from '../types/todo'

export interface TodoFilters {
  importance: Priority | 'all'
  urgency: Priority | 'all'
  tag: string | 'all'
}

function createId(): string {
  return crypto.randomUUID()
}

export const useTodosStore = defineStore('todos', () => {
  const todos = useLocalStorage<Todo[]>('openpomodoro.todos', [])
  const filters = useLocalStorage<TodoFilters>('openpomodoro.todoFilters', {
    importance: 'all',
    urgency: 'all',
    tag: 'all',
  })

  const allTags = computed(() => {
    const tags = new Set<string>()
    for (const todo of todos.value) {
      for (const tag of todo.tags) tags.add(tag)
    }
    return Array.from(tags).sort()
  })

  const filteredTodos = computed(() => {
    return todos.value
      .filter((todo) => filters.value.importance === 'all' || todo.importance === filters.value.importance)
      .filter((todo) => filters.value.urgency === 'all' || todo.urgency === filters.value.urgency)
      .filter((todo) => filters.value.tag === 'all' || todo.tags.includes(filters.value.tag))
      .sort((a, b) => a.order - b.order)
  })

  function addTodo(input: { title: string; importance: Priority; urgency: Priority; tags: string[] }) {
    const maxOrder = todos.value.reduce((max, t) => Math.max(max, t.order), -1)
    todos.value.push({
      id: createId(),
      title: input.title,
      importance: input.importance,
      urgency: input.urgency,
      tags: input.tags,
      done: false,
      order: maxOrder + 1,
      createdAt: Date.now(),
    })
  }

  function removeTodo(id: string) {
    todos.value = todos.value.filter((todo) => todo.id !== id)
  }

  function toggleDone(id: string) {
    const todo = todos.value.find((t) => t.id === id)
    if (todo) todo.done = !todo.done
  }

  function moveTodo(id: string, direction: -1 | 1) {
    const sorted = [...todos.value].sort((a, b) => a.order - b.order)
    const index = sorted.findIndex((t) => t.id === id)
    const targetIndex = index + direction
    if (index === -1 || targetIndex < 0 || targetIndex >= sorted.length) return
    const a = sorted[index]
    const b = sorted[targetIndex]
    const tempOrder = a.order
    a.order = b.order
    b.order = tempOrder
  }

  function setFilters(next: Partial<TodoFilters>) {
    filters.value = { ...filters.value, ...next }
  }

  function exportTodos(): TodoExport {
    return { version: 1, todos: todos.value }
  }

  function importTodos(data: TodoExport) {
    if (!data || data.version !== 1 || !Array.isArray(data.todos)) {
      throw new Error('Invalid OpenPomodoro to-do file')
    }
    todos.value = data.todos
  }

  function reset() {
    todos.value = []
    filters.value = { importance: 'all', urgency: 'all', tag: 'all' }
  }

  return {
    todos,
    filters,
    allTags,
    filteredTodos,
    addTodo,
    removeTodo,
    toggleDone,
    moveTodo,
    setFilters,
    exportTodos,
    importTodos,
    reset,
  }
})
