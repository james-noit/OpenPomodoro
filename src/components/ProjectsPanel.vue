<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProjectsStore } from '../stores/projects'
import ProjectForm from './ProjectForm.vue'
import ProjectTreeItem from './ProjectTreeItem.vue'

const props = defineProps<{
  multitaskMode?: boolean
  isTaskPickable?: (todoId: string) => boolean
  onPickTask?: (todoId: string) => void
}>()

const { t } = useI18n()
const projects = useProjectsStore()

const creating = ref(false)

function createProject(data: { icon: string; name: string; description: string; notes: string }) {
  projects.addProject(data)
  creating.value = false
}
</script>

<template>
  <div class="projects-panel">
    <div class="projects-panel__toolbar">
      <button type="button" class="projects-panel__new" @click="creating = !creating">
        {{ t('projects.newProject') }}
      </button>
    </div>

    <ProjectForm v-if="creating" @save="createProject" @cancel="creating = false" />

    <p v-if="!projects.sortedProjects.length && !creating" class="projects-panel__empty">
      {{ t('projects.noProjects') }}
    </p>
    <div v-else class="projects-panel__list">
      <ProjectTreeItem
        v-for="project in projects.sortedProjects"
        :key="project.id"
        :project="project"
        :multitask-mode="props.multitaskMode"
        :is-task-pickable="props.isTaskPickable"
        :on-pick-task="props.onPickTask"
      />
    </div>
  </div>
</template>

<style scoped>
.projects-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.projects-panel__toolbar {
  display: flex;
  justify-content: flex-end;
}

.projects-panel__new {
  background-color: var(--color-primary);
  color: var(--color-primary-contrast);
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1.25rem;
}

.projects-panel__empty {
  color: var(--color-text-muted);
}

.projects-panel__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
