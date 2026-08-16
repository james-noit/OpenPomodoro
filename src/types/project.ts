export interface Project {
  id: string
  icon: string
  name: string
  description: string
  notes: string
  order: number
  createdAt: number
}

export interface Milestone {
  id: string
  projectId: string
  name: string
  order: number
  createdAt: number
}

export interface ProjectExport {
  projects: Project[]
  milestones: Milestone[]
}
