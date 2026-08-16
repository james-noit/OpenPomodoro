<script setup lang="ts">
import { computed } from 'vue'
import { useProjectsStore } from '../stores/projects'
import type { Todo } from '../types/todo'

const props = defineProps<{ todo: Todo }>()
const projects = useProjectsStore()

const project = computed(() => projects.projects.find((p) => p.id === props.todo.projectId))
const milestone = computed(() => projects.milestones.find((m) => m.id === props.todo.milestoneId))
</script>

<template>
  <div
    v-if="project"
    class="task-project-tag"
    :title="milestone ? `${project.name} · ${milestone.name}` : project.name"
  >
    <span class="task-project-tag__project">
      <span aria-hidden="true">{{ project.icon }}</span>
      {{ project.name }}
    </span>
    <span v-if="milestone" class="task-project-tag__milestone">
      <span class="task-project-tag__arrow" aria-hidden="true">↳</span>
      {{ milestone.name }}
    </span>
  </div>
</template>

<style scoped>
.task-project-tag {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 0.05rem;
  font-size: 0.65rem;
  line-height: 1.25;
  color: var(--color-text-muted);
}

@media (min-width: 480px) {
  .task-project-tag {
    position: absolute;
    right: 0.6rem;
    bottom: 0.4rem;
    align-items: flex-end;
    text-align: right;
    max-width: 55%;
    pointer-events: none;
  }
}

.task-project-tag__project,
.task-project-tag__milestone {
  display: block;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-project-tag__project {
  font-weight: 600;
}

.task-project-tag__milestone {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
}

.task-project-tag__arrow {
  flex-shrink: 0;
}
</style>
