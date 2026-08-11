import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
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
      .filter((todo) => !todo.done)
      .filter((todo) => filters.value.importance === 'all' || todo.importance === filters.value.importance)
      .filter((todo) => filters.value.urgency === 'all' || todo.urgency === filters.value.urgency)
      .filter((todo) => filters.value.tag === 'all' || todo.tags.includes(filters.value.tag))
      .sort((a, b) => a.order - b.order)
  })

  const completedTodos = computed(() => {
    return todos.value
      .filter((todo) => todo.done)
      .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
  })

  const draggedId = ref<string | null>(null)

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
    if (!todo) return
    todo.done = !todo.done
    todo.completedAt = todo.done ? Date.now() : undefined
  }

  function moveTodo(id: string, direction: -1 | 1) {
    const sorted = todos.value.filter((t) => !t.done).sort((a, b) => a.order - b.order)
    const index = sorted.findIndex((t) => t.id === id)
    const targetIndex = index + direction
    if (index === -1 || targetIndex < 0 || targetIndex >= sorted.length) return
    const a = sorted[index]
    const b = sorted[targetIndex]
    const tempOrder = a.order
    a.order = b.order
    b.order = tempOrder
  }

  function reorderTodo(draggedTodoId: string, targetTodoId: string) {
    if (draggedTodoId === targetTodoId) return
    const sorted = todos.value.filter((t) => !t.done).sort((a, b) => a.order - b.order)
    const fromIndex = sorted.findIndex((t) => t.id === draggedTodoId)
    const toIndex = sorted.findIndex((t) => t.id === targetTodoId)
    if (fromIndex === -1 || toIndex === -1) return
    const [moved] = sorted.splice(fromIndex, 1)
    sorted.splice(toIndex, 0, moved)
    sorted.forEach((todo, index) => {
      todo.order = index
    })
  }

  function startDrag(id: string) {
    draggedId.value = id
  }

  function dropOnTodo(targetId: string) {
    if (draggedId.value) reorderTodo(draggedId.value, targetId)
    draggedId.value = null
  }

  function endDrag() {
    draggedId.value = null
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
    completedTodos,
    draggedId,
    addTodo,
    removeTodo,
    toggleDone,
    moveTodo,
    reorderTodo,
    startDrag,
    dropOnTodo,
    endDrag,
    setFilters,
    exportTodos,
    importTodos,
    reset,
  }
})
