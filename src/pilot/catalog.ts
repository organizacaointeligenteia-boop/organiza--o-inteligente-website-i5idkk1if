import type {
  EditorialModel,
  EditorialModelKey,
  KitSampleItem,
  PilotTimeAvailable,
  PilotPreferredFormat,
  PilotTopic,
  RoutineStepItem,
  GuidanceStepItem,
} from './types'

export const EDITORIAL_CATALOG: Record<EditorialModelKey, EditorialModel> = {
  priorities: {
    key: 'priorities',
    name: 'Lista de prioridades',
    subtitle: 'Distinguir o essencial do que pode esperar',
    description:
      'Uma estrutura prática para listar tarefas do dia, separar o compromisso principal do restante e evitar sobrecarga mental.',
    examples: [
      'Preparar apresentação da reunião',
      'Separar documentos pendentes de envio',
      'Reservar pausa de 15 minutos sem telas',
    ],
    disclaimer: 'Exemplo editorial fictício para demonstração de uso.',
  },
  week: {
    key: 'week',
    name: 'Mapa da semana',
    subtitle: 'Compromissos e espaços livres com visão clara',
    description:
      'Um panorama visual em blocos para visualizar compromissos inegociáveis e identificar intervalos abertos para imprevistos.',
    examples: [
      'Segunda-feira: organizar próximos passos e conferir pendências',
      'Quarta-feira: revisar andamento dos projetos e alinhar tarefas',
      'Sexta-feira: ajustar pendências da semana e fechar o ciclo',
    ],
    disclaimer: 'Exemplo editorial fictício para demonstração de uso.',
  },
  steps: {
    key: 'steps',
    name: 'Guia de pequenos passos',
    subtitle: 'Uma ação viável de cada vez para construir constância',
    description:
      'Um método gradual para reduzir a inércia: escolha uma única ação possível, aplique no momento oportuno e avalie o resultado.',
    examples: [
      'Escolher uma ação viável para começar agora',
      'Testar em um momento possível do seu dia',
      'Rever com calma o que funcionou e o que ajustar',
    ],
    disclaimer: 'Exemplo editorial fictício para demonstração de uso.',
  },
}

export const KIT_SAMPLES: KitSampleItem[] = [
  {
    key: 'priorities',
    name: 'Lista de prioridades (Amostra Fictícia)',
    badge: 'Formato Curto',
    structure: [
      'Cabeçalho: Foco único do turno',
      'Seção 1: Até 3 compromissos inadiáveis',
      'Seção 2: Tarefas secundárias do dia',
      'Seção 3: Registro de pausas intencionais',
    ],
    sampleText:
      'Simulação de preenchimento: 1. Concluir relatório mensal • 2. Separar comprovantes fiscais • 3. Caminhada leve de 15 minutos.',
  },
  {
    key: 'week',
    name: 'Mapa da semana (Amostra Fictícia)',
    badge: 'Visão Semanal',
    structure: [
      'Blocos matutinos: Abertura e foco prioritário',
      'Blocos vespertinos: Reuniões e rotinas operacionais',
      'Margem de proteção: Intervalo livre diário para imprevistos',
      'Revisão da sexta-feira: Balanço de conquistas e ajustes',
    ],
    sampleText:
      'Simulação de preenchimento: Segunda para planejamento de prioridades • Quarta para checagem de prazos • Sexta para fechar semana e planejar descanso.',
  },
  {
    key: 'steps',
    name: 'Guia de pequenos passos (Amostra Fictícia)',
    badge: 'Passo a Passo',
    structure: [
      'Ação âncora: Microtarefa viável de 5 minutos',
      'Gatilho de contexto: Onde e quando realizar',
      'Espaço de registro: Anotação rápida da execução',
      'Revisão adaptativa: O que manter para o dia seguinte',
    ],
    sampleText:
      'Simulação de preenchimento: Microação: abrir a lista e escolher um único item • Contexto: logo após o almoço • Avaliação: sensação de tarefa destravada.',
  },
]

export const TOPIC_LABELS: Record<PilotTopic, string> = {
  time: 'Distribuir meu tempo',
  priorities: 'Definir prioridades',
  consistency: 'Criar constância',
  general: 'Organização geral',
}

export const TIME_LABELS: Record<PilotTimeAvailable, string> = {
  '5m': '5 minutos',
  '10m': '10 minutos',
  '20m': '20 minutos',
}

export const TIME_MINUTES_MAP: Record<PilotTimeAvailable, number> = {
  '5m': 5,
  '10m': 10,
  '20m': 20,
}

export const FORMAT_LABELS: Record<PilotPreferredFormat, string> = {
  priorities: 'Uma lista curta',
  week: 'Uma visão da semana',
  steps: 'Um passo de cada vez',
}

/**
 * Resolves the suggested editorial model based on user topic.
 * - Distribuir meu tempo (time) -> week
 * - Criar constância (consistency) -> steps
 * - Otherwise (priorities / general) -> priorities
 *
 * NOTE: If explicit format is provided, it OVERRULES the suggestion.
 */
export function resolveSuggestedModel(
  topic?: PilotTopic,
  explicitFormat?: PilotPreferredFormat,
): EditorialModelKey {
  if (explicitFormat) {
    return explicitFormat
  }
  if (topic === 'time') {
    return 'week'
  }
  if (topic === 'consistency') {
    return 'steps'
  }
  return 'priorities'
}

/**
 * Builds 3 contextual checklist steps for the Routine path card.
 */
export function buildRoutineSteps(
  formatKey: EditorialModelKey,
  minutes: number,
): RoutineStepItem[] {
  if (formatKey === 'week') {
    return [
      {
        id: 'step-week-1',
        text: `Identificar 2 compromissos inegociáveis da semana (${Math.max(1, Math.round(minutes * 0.4))} min)`,
        detail: 'Anote compromissos com horário marcado para enxergar seus blocos livres.',
      },
      {
        id: 'step-week-2',
        text: `Reservar 1 bloco de respiro para imprevistos (${Math.max(1, Math.round(minutes * 0.3))} min)`,
        detail: 'Deixe um intervalo sem tarefas agendadas para acolher demandas urgentes.',
      },
      {
        id: 'step-week-3',
        text: `Revisar o próximo passo de amanhã (${Math.max(1, Math.round(minutes * 0.3))} min)`,
        detail: 'Defina apenas a primeira ação da manhã seguinte para iniciar sem hesitação.',
      },
    ]
  }

  if (formatKey === 'steps') {
    return [
      {
        id: 'step-prog-1',
        text: `Escolher 1 microação simples para hoje (${Math.max(1, Math.round(minutes * 0.3))} min)`,
        detail: 'Selecione uma ação curta que não exija preparação excessiva.',
      },
      {
        id: 'step-prog-2',
        text: `Executar no momento mais acessível do seu turno (${Math.max(1, Math.round(minutes * 0.4))} min)`,
        detail: 'Foque apenas no início da tarefa, sem se preocupar em concluí-la toda.',
      },
      {
        id: 'step-prog-3',
        text: `Registrar se a ação foi leve ou pesada (${Math.max(1, Math.round(minutes * 0.3))} min)`,
        detail: 'Anote mentalmente ou no rascunho o que facilitou o início.',
      },
    ]
  }

  // priorities (default)
  return [
    {
      id: 'step-prio-1',
      text: `Listar no rascunho 3 pendências urgentes (${Math.max(1, Math.round(minutes * 0.4))} min)`,
      detail: 'Tire tudo da cabeça sem filtrar ainda a ordem de importância.',
    },
    {
      id: 'step-prio-2',
      text: `Destacar uma única tarefa essencial do dia (${Math.max(1, Math.round(minutes * 0.3))} min)`,
      detail: 'Escolha aquela que, se finalizada, torna o seu dia produtivo.',
    },
    {
      id: 'step-prio-3',
      text: `Definir o que pode esperar o próximo ciclo (${Math.max(1, Math.round(minutes * 0.3))} min)`,
      detail: 'Mova o restante para uma lista de apoio sem culpa.',
    },
  ]
}

/**
 * Builds 3 guidance steps for the Guidance path.
 */
export function buildGuidanceSteps(
  formatKey: EditorialModelKey,
  minutes: number,
): GuidanceStepItem[] {
  const modelName = EDITORIAL_CATALOG[formatKey].name
  return [
    {
      stepNumber: 1,
      title: `Abrir o exemplo editorial da ${modelName}`,
      description:
        'Observe a estrutura básica dos campos e veja como as informações são agrupadas sem poluição visual.',
    },
    {
      stepNumber: 2,
      title: `Simular o preenchimento em cerca de ${minutes} minutos`,
      description:
        'Faça um teste rápido com dados fictícios ou com um rascunho simples para testar o ritmo.',
    },
    {
      stepNumber: 3,
      title: 'Ajustar um detalhe prático para sua realidade',
      description:
        'Adapte os nomes das categorias ou horários conforme sua rotina diária ou compromissos familiares.',
    },
  ]
}
