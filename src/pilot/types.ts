export type PilotPath = 'routine' | 'kit' | 'guidance'

export type PilotTopic = 'time' | 'priorities' | 'consistency' | 'general'

export type PilotTimeAvailable = '5m' | '10m' | '20m'

export type PilotPreferredFormat = 'priorities' | 'week' | 'steps'

export interface PilotChoices {
  topic?: PilotTopic
  time?: PilotTimeAvailable
  format?: PilotPreferredFormat
}

export type EditorialModelKey = 'priorities' | 'week' | 'steps'

export interface EditorialModel {
  key: EditorialModelKey
  name: string
  subtitle: string
  description: string
  examples: string[]
  disclaimer: string
}

export interface RoutineStepItem {
  id: string
  text: string
  detail: string
}

export interface GuidanceStepItem {
  stepNumber: number
  title: string
  description: string
}

export interface KitSampleItem {
  key: EditorialModelKey
  name: string
  badge: string
  structure: string[]
  sampleText: string
}
