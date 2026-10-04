import { useState, useId, useEffect } from 'react'
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  X,
  Compass,
  Calendar,
  BookOpen,
  Info,
} from 'lucide-react'
import type {
  PilotPath,
  PilotTopic,
  PilotTimeAvailable,
  PilotPreferredFormat,
  PilotChoices,
  EditorialModelKey,
} from './types'
import {
  EDITORIAL_CATALOG,
  KIT_SAMPLES,
  TOPIC_LABELS,
  TIME_LABELS,
  TIME_MINUTES_MAP,
  FORMAT_LABELS,
  resolveSuggestedModel,
  buildRoutineSteps,
  buildGuidanceSteps,
} from './catalog'
import { classifyFreeText, type ClassificationOutput } from './classifier'

export default function PilotOrganizacaoPage() {
  // Pure local React states
  const [selectedPath, setSelectedPath] = useState<PilotPath | null>(null)
  const [choices, setChoices] = useState<PilotChoices>({})
  const [usePersonalization, setUsePersonalization] = useState<boolean>(true)
  const [userInterests, setUserInterests] = useState<string[]>([])
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({})
  const [previewModelKey, setPreviewModelKey] = useState<EditorialModelKey>('priorities')

  // Textarea state
  const [freeText, setFreeText] = useState<string>('')
  const [classificationResult, setClassificationResult] = useState<ClassificationOutput | null>(
    null,
  )

  // Status notification for screen readers
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('')

  // Unique accessible IDs
  const textInputId = useId()
  const personalizeCheckboxId = useId()

  // Apply noindex, nofollow solely for this route
  useEffect(() => {
    let robotsMeta = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    const originalContent = robotsMeta ? robotsMeta.getAttribute('content') : null

    if (!robotsMeta) {
      robotsMeta = document.createElement('meta')
      robotsMeta.setAttribute('name', 'robots')
      document.head.appendChild(robotsMeta)
    }
    robotsMeta.setAttribute('content', 'noindex, nofollow')

    const prevTitle = document.title
    document.title = 'Piloto de Demonstração · Organização Inteligente'

    return () => {
      document.title = prevTitle
      if (robotsMeta) {
        if (originalContent) {
          robotsMeta.setAttribute('content', originalContent)
        } else {
          robotsMeta.remove()
        }
      }
    }
  }, [])

  // Helper to add unique local interest
  const addUniqueInterest = (label: string) => {
    if (!usePersonalization) return
    setUserInterests((prev) => {
      if (prev.includes(label)) return prev
      return [...prev, label]
    })
  }

  // Remove local interest
  const removeInterest = (label: string) => {
    setUserInterests((prev) => prev.filter((item) => item !== label))
    setLiveAnnouncement(`Interesse ${label} removido.`)
  }

  // Handle opt-out of personalization
  const handleTogglePersonalization = (checked: boolean) => {
    setUsePersonalization(checked)
    if (!checked) {
      // Clear all personalized preferences and interests immediately
      setUserInterests([])
      setCheckedSteps({})
      setChoices({})
      setClassificationResult(null)
      setLiveAnnouncement('Personalização desativada. Preferências da sessão foram limpas.')
    } else {
      setLiveAnnouncement('Personalização da sessão ativada.')
    }
  }

  // Handle Global Reset ("Recomeçar")
  const handleResetAll = () => {
    setSelectedPath(null)
    setChoices({})
    setUserInterests([])
    setCheckedSteps({})
    setPreviewModelKey('priorities')
    setFreeText('')
    setClassificationResult(null)
    setLiveAnnouncement(
      'Demonstração reiniciada. Todos os passos e seleções voltaram ao estado inicial.',
    )
  }

  // Handle Path change
  const handleSelectPath = (path: PilotPath) => {
    setSelectedPath(path)
    setClassificationResult(null) // clear any pending banner
    setCheckedSteps({}) // reset steps on path switch

    const pathLabels: Record<PilotPath, string> = {
      routine: 'Organizar minha rotina',
      kit: 'Conhecer a ferramenta / kit',
      guidance: 'Receber orientação de uso',
    }
    addUniqueInterest(pathLabels[path])
    setLiveAnnouncement(`Caminho selecionado: ${pathLabels[path]}`)
  }

  // Choice handlers
  const handleSelectTopic = (topic: PilotTopic) => {
    setChoices((prev) => ({ ...prev, topic }))
    addUniqueInterest(TOPIC_LABELS[topic])
    setLiveAnnouncement(`Objetivo selecionado: ${TOPIC_LABELS[topic]}`)
  }

  const handleSelectTime = (time: PilotTimeAvailable) => {
    setChoices((prev) => ({ ...prev, time }))
    addUniqueInterest(TIME_LABELS[time])
    setLiveAnnouncement(`Tempo selecionado: ${TIME_LABELS[time]}`)
  }

  const handleSelectFormat = (format: PilotPreferredFormat) => {
    setChoices((prev) => ({ ...prev, format }))
    addUniqueInterest(FORMAT_LABELS[format])
    setPreviewModelKey(format)
    setLiveAnnouncement(`Formato selecionado: ${FORMAT_LABELS[format]}`)
  }

  // Step checkbox toggle
  const handleToggleStep = (stepId: string) => {
    setCheckedSteps((prev) => {
      const updated = { ...prev, [stepId]: !prev[stepId] }
      const isNowChecked = updated[stepId]
      setLiveAnnouncement(isNowChecked ? 'Passo marcado como concluído' : 'Passo desmarcado')
      return updated
    })
  }

  // Free text submission
  const handleProcessFreeText = () => {
    const raw = freeText.trim()
    if (!raw) return

    const result = classifyFreeText(raw)
    setClassificationResult(result)

    // Clear input field and character counter immediately (privacy / no echoing)
    setFreeText('')

    if (result.intent === 'restricted') {
      setLiveAnnouncement('Aviso: o texto aborda tema fora do escopo desta demonstração.')
      return
    }

    if (result.intent === 'unknown') {
      setLiveAnnouncement(
        'Texto livre não identificado por regras simples. Por favor, escolha um dos três caminhos disponíveis.',
      )
      return
    }

    if (result.suggestedPath) {
      setSelectedPath(result.suggestedPath)
      setCheckedSteps({})

      if (result.topic !== 'general') {
        setChoices((prev) => ({ ...prev, topic: result.topic }))
        addUniqueInterest(TOPIC_LABELS[result.topic])
      }

      const pathNames: Record<PilotPath, string> = {
        routine: 'Organizar minha rotina',
        kit: 'Conhecer a ferramenta / kit',
        guidance: 'Receber orientação de uso',
      }
      addUniqueInterest(pathNames[result.suggestedPath])
      setLiveAnnouncement(`Caminho sugerido por regra local: ${pathNames[result.suggestedPath]}`)
    }
  }

  // Calculated values
  const choicesCount = (choices.topic ? 1 : 0) + (choices.time ? 1 : 0) + (choices.format ? 1 : 0)
  const currentFormatKey = resolveSuggestedModel(choices.topic, choices.format)
  const currentMinutes = choices.time ? TIME_MINUTES_MAP[choices.time] : 5
  const routineSteps = buildRoutineSteps(currentFormatKey, currentMinutes)
  const completedRoutineStepsCount = routineSteps.filter((s) => checkedSteps[s.id]).length
  const guidanceSteps = buildGuidanceSteps(currentFormatKey, currentMinutes)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-slate-200">
      {/* Skip link for keyboard accessibility */}
      <a
        href="#pilot-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-slate-900 text-white px-4 py-2 rounded-md font-medium shadow-md"
      >
        Pular para o conteúdo da demonstração
      </a>

      {/* Accessible Live Region for screen readers */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* Header específico do piloto */}
      <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight whitespace-nowrap">
              Organização Inteligente
            </span>
            <span
              className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap"
              aria-label="Ambiente Piloto e Demonstração"
            >
              <Sparkles className="w-3 h-3 text-emerald-600" aria-hidden="true" />
              PILOTO · DEMONSTRAÇÃO
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetAll}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 min-h-[36px]"
            aria-label="Recomeçar demonstração do início"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Recomeçar
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main
        id="pilot-content"
        role="main"
        className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8"
      >
        {/* Banner de transparência e limites */}
        <section
          aria-labelledby="banner-title"
          className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 sm:p-5 text-blue-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" aria-hidden="true" />
            <div className="space-y-1">
              <h2 id="banner-title" className="text-sm font-semibold">
                Respostas prontas e dados fictícios. Nenhuma IA ou Jev conectado. Sem envio de
                dados.
              </h2>
              <p className="text-xs text-blue-800/90 leading-relaxed">
                Este módulo opera 100% no seu navegador com regras locais predefinidas. Nenhuma
                informação digitada é salva, enviada ou transmitida.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
            <input
              id={personalizeCheckboxId}
              type="checkbox"
              checked={usePersonalization}
              onChange={(e) => handleTogglePersonalization(e.target.checked)}
              className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
            />
            <label
              htmlFor={personalizeCheckboxId}
              className="text-xs font-medium text-slate-800 cursor-pointer"
            >
              Usar minhas escolhas nesta sessão
            </label>
          </div>
        </section>

        {/* Tags de interesses acumulados (se houver e personalização ligada) */}
        {usePersonalization && userInterests.length > 0 && (
          <section aria-label="Interesses selecionados nesta sessão" className="space-y-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Seus interesses identificados nesta sessão:
            </span>
            <div className="flex flex-wrap gap-2">
              {userInterests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1.5 text-xs font-medium bg-white text-slate-800 border border-slate-200 pl-2.5 pr-1.5 py-1 rounded-full shadow-2xs"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => removeInterest(interest)}
                    className="p-0.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-800"
                    aria-label={`Remover interesse ${interest}`}
                  >
                    <X className="w-3 h-3" aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Aviso de tema restrito se acionado por texto livre */}
        {classificationResult?.intent === 'restricted' && (
          <div
            role="alert"
            className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 sm:p-5 space-y-2"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-semibold text-amber-950">
                  Tema fora do escopo desta demonstração
                </h3>
                <p className="text-xs sm:text-sm text-amber-800 mt-1 leading-relaxed">
                  {classificationResult.restrictedReason}
                </p>
                <p className="text-xs text-amber-700 mt-2 font-medium">
                  Para continuar a exploração de métodos de organização pessoal, escolha um dos
                  caminhos abaixo:
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Aviso de texto desconhecido */}
        {classificationResult?.intent === 'unknown' && (
          <div
            role="alert"
            className="bg-slate-100 border border-slate-200 text-slate-800 rounded-2xl p-4 space-y-1"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-600" aria-hidden="true" />
              <p className="text-xs sm:text-sm font-medium">
                Não identificamos palavras-chave conhecidas no texto. Por favor, escolha um dos 3
                caminhos pelos botões abaixo para iniciar sua experiência.
              </p>
            </div>
          </div>
        )}

        {/* Seção 1: Ponto de partida (Caminhos) */}
        <section aria-labelledby="start-title" className="space-y-4">
          <div className="space-y-1">
            <h1
              id="start-title"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900"
            >
              Por onde você quer começar?
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Conte o que procura ou escolha um caminho.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              aria-pressed={selectedPath === 'routine'}
              onClick={() => handleSelectPath('routine')}
              className={`text-left p-5 rounded-2xl border transition-all duration-200 min-h-[120px] flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ${
                selectedPath === 'routine'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-base sm:text-lg">Organizar minha rotina</span>
                <Clock
                  className={`w-5 h-5 shrink-0 ${
                    selectedPath === 'routine' ? 'text-white' : 'text-slate-500'
                  }`}
                  aria-hidden="true"
                />
              </div>
              <p
                className={`text-xs sm:text-sm mt-2 leading-relaxed ${
                  selectedPath === 'routine' ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Tempo, prioridades e constância para o dia a dia.
              </p>
            </button>

            <button
              type="button"
              aria-pressed={selectedPath === 'kit'}
              onClick={() => handleSelectPath('kit')}
              className={`text-left p-5 rounded-2xl border transition-all duration-200 min-h-[120px] flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ${
                selectedPath === 'kit'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-base sm:text-lg">
                  Conhecer a ferramenta / kit
                </span>
                <BookOpen
                  className={`w-5 h-5 shrink-0 ${
                    selectedPath === 'kit' ? 'text-white' : 'text-slate-500'
                  }`}
                  aria-hidden="true"
                />
              </div>
              <p
                className={`text-xs sm:text-sm mt-2 leading-relaxed ${
                  selectedPath === 'kit' ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Explorar formatos e modelos editoriais de organização.
              </p>
            </button>

            <button
              type="button"
              aria-pressed={selectedPath === 'guidance'}
              onClick={() => handleSelectPath('guidance')}
              className={`text-left p-5 rounded-2xl border transition-all duration-200 min-h-[120px] flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ${
                selectedPath === 'guidance'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-base sm:text-lg">
                  Receber orientação de uso
                </span>
                <Compass
                  className={`w-5 h-5 shrink-0 ${
                    selectedPath === 'guidance' ? 'text-white' : 'text-slate-500'
                  }`}
                  aria-hidden="true"
                />
              </div>
              <p
                className={`text-xs sm:text-sm mt-2 leading-relaxed ${
                  selectedPath === 'guidance' ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Experimentar um passo estruturado de cada vez.
              </p>
            </button>
          </div>
        </section>

        {/* Seção 2: Campo opcional de texto livre */}
        <section
          aria-labelledby="free-text-title"
          className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h2 id="free-text-title" className="text-sm font-semibold text-slate-900">
              Quer descrever o que você precisa agora? (Opcional)
            </h2>
            <span className="text-xs text-slate-500" aria-live="polite">
              {freeText.length}/300 caracteres
            </span>
          </div>

          <label htmlFor={textInputId} className="sr-only">
            Exemplo de rotina ou objetivo que você quer facilitar
          </label>
          <textarea
            id={textInputId}
            value={freeText}
            onChange={(e) => setFreeText(e.target.value.slice(0, 300))}
            maxLength={300}
            rows={2}
            placeholder="Ex.: Gostaria de organizar minha semana e definir prioridades..."
            className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none transition-colors"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className="text-xs text-slate-500">
              Use apenas exemplos fictícios. Não informe dados pessoais.
            </p>

            <button
              type="button"
              disabled={!freeText.trim()}
              onClick={handleProcessFreeText}
              className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500 px-4 py-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 min-h-[38px]"
            >
              Encontrar meu caminho
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </section>

        {/* Seção 3: Fluxo de Escolhas (comum a todos os caminhos) */}
        <section
          aria-labelledby="choices-title"
          className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 id="choices-title" className="text-lg font-bold text-slate-900">
                Ajuste seu momento
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Três perguntas rápidas para calibrar os exemplos e o tempo da demonstração.
              </p>
            </div>
            <div
              className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold"
              aria-label={`Progresso das escolhas: ${choicesCount} de 3 selecionadas`}
            >
              <span>Progresso:</span>
              <span className="text-slate-900">{choicesCount}/3</span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Pergunta 1: Objetivo */}
            <fieldset className="space-y-2.5">
              <legend className="text-sm font-semibold text-slate-800">
                1. O que você quer facilitar?
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { key: 'time' as PilotTopic, label: 'Distribuir meu tempo' },
                  { key: 'priorities' as PilotTopic, label: 'Definir prioridades' },
                  { key: 'consistency' as PilotTopic, label: 'Criar constância' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={choices.topic === item.key}
                    onClick={() => handleSelectTopic(item.key)}
                    className={`text-center py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 min-h-[44px] ${
                      choices.topic === item.key
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Pergunta 2: Tempo */}
            <fieldset className="space-y-2.5">
              <legend className="text-sm font-semibold text-slate-800">
                2. Quanto tempo cabe agora?
              </legend>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { key: '5m' as PilotTimeAvailable, label: '5 minutos' },
                  { key: '10m' as PilotTimeAvailable, label: '10 minutos' },
                  { key: '20m' as PilotTimeAvailable, label: '20 minutos' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={choices.time === item.key}
                    onClick={() => handleSelectTime(item.key)}
                    className={`text-center py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 min-h-[44px] ${
                      choices.time === item.key
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Pergunta 3: Formato */}
            <fieldset className="space-y-2.5">
              <legend className="text-sm font-semibold text-slate-800">
                3. Qual formato prefere experimentar?
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { key: 'priorities' as PilotPreferredFormat, label: 'Uma lista curta' },
                  { key: 'week' as PilotPreferredFormat, label: 'Uma visão da semana' },
                  { key: 'steps' as PilotPreferredFormat, label: 'Um passo de cada vez' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={choices.format === item.key}
                    onClick={() => handleSelectFormat(item.key)}
                    className={`text-center py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 min-h-[44px] ${
                      choices.format === item.key
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        </section>

        {/* Seção 4: Resultado Dinâmico de acordo com o caminho ativo */}
        {selectedPath === 'routine' && (
          <section
            aria-labelledby="routine-result-title"
            className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Sugestão baseada em {EDITORIAL_CATALOG[currentFormatKey].name}
                </span>
                <h2
                  id="routine-result-title"
                  className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5"
                >
                  Um começo em {currentMinutes} minutos
                </h2>
              </div>
              <div
                className="inline-flex items-center gap-2 bg-slate-100 text-slate-800 px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0"
                aria-label={`Passos concluídos: ${completedRoutineStepsCount} de 3`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <span>Passos concluídos: {completedRoutineStepsCount} de 3</span>
              </div>
            </div>

            <div className="space-y-3">
              {routineSteps.map((step) => {
                const isChecked = !!checkedSteps[step.id]
                return (
                  <div
                    key={step.id}
                    className={`flex items-start gap-3.5 p-4 rounded-xl border transition-colors ${
                      isChecked
                        ? 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70 text-slate-800'
                    }`}
                  >
                    <input
                      id={step.id}
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleStep(step.id)}
                      className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 mt-0.5 cursor-pointer"
                    />
                    <label
                      htmlFor={step.id}
                      className="cursor-pointer space-y-0.5 select-none flex-1"
                    >
                      <p
                        className={`text-sm font-semibold ${isChecked ? 'line-through text-slate-500' : ''}`}
                      >
                        {step.text}
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed">{step.detail}</p>
                    </label>
                  </div>
                )
              })}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Nota:</span> Esta rotina é uma
              simulação adaptável para destravar o início de forma leve. Você pode desmarcar e
              repetir conforme sua disponibilidade.
            </div>
          </section>
        )}

        {selectedPath === 'guidance' && (
          <section
            aria-labelledby="guidance-result-title"
            className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs"
          >
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Roteiro Local de Uso
              </span>
              <h2
                id="guidance-result-title"
                className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5"
              >
                Orientação passo a passo ({currentMinutes} minutos)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Um roteiro simples para testar a estrutura da{' '}
                {EDITORIAL_CATALOG[currentFormatKey].name}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {guidanceSteps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 bg-slate-900 text-white rounded-full font-bold text-xs">
                      {step.stepNumber}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">{step.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{step.description}</p>
                  </div>
                  <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-200/60 font-medium">
                    Demonstração editorial guiada
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {selectedPath === 'kit' && (
          <section
            aria-labelledby="kit-result-title"
            className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs"
          >
            <div className="border-b border-slate-100 pb-4 space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Catálogo de Demonstração
              </span>
              <h2 id="kit-result-title" className="text-xl sm:text-2xl font-bold text-slate-900">
                Amostras Editoriais Fictícias
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Explore a estrutura dos três modelos conceituais. Amostras ilustrativas sem preço ou
                compra.
              </p>
            </div>

            {/* Alternar abas de amostras */}
            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label="Formatos do catálogo editorial"
            >
              {KIT_SAMPLES.map((sample) => (
                <button
                  key={sample.key}
                  type="button"
                  role="tab"
                  aria-selected={previewModelKey === sample.key}
                  onClick={() => setPreviewModelKey(sample.key)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 min-h-[40px] ${
                    previewModelKey === sample.key
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {sample.name.replace(' (Amostra Fictícia)', '')}
                </button>
              ))}
            </div>

            {/* Exibição da amostra selecionada */}
            {(() => {
              const currentSample =
                KIT_SAMPLES.find((s) => s.key === previewModelKey) || KIT_SAMPLES[0]
              const editorialInfo = EDITORIAL_CATALOG[previewModelKey]

              return (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-slate-900">
                        {currentSample.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600">{editorialInfo.subtitle}</p>
                    </div>
                    <span className="inline-block text-xs font-semibold bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded-full w-fit">
                      {currentSample.badge}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Estrutura do Modelo:
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700">
                      {currentSample.structure.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 bg-white border border-slate-200/70 p-2.5 rounded-lg"
                        >
                          <CheckCircle2
                            className="w-4 h-4 text-slate-500 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Exemplo Fictício de Uso:
                    </span>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-mono">
                      {currentSample.sampleText}
                    </p>
                  </div>

                  <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed">
                    <strong>Aviso de Demonstração:</strong> Os materiais exibidos nesta tela são
                    amostras conceituais fictícias e não representam oferta comercial,
                    disponibilidade de estoque, composição contratual ou promessa de entrega do Kit
                    comercial real. Não há preço, venda nem checkout nesta demonstração.
                  </div>
                </div>
              )
            })()}
          </section>
        )}

        {/* Seção 5: Explicações Técnicas e Limites da Demonstração */}
        <footer className="pt-6 border-t border-slate-200 text-xs text-slate-500 space-y-3 leading-relaxed">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" aria-hidden="true" />
            <p>
              <strong>Sobre esta demonstração:</strong> A classificação de intenção é simulada
              exclusivamente por regras locais de correspondência em memória React, sem conexão a
              modelos de linguagem ou servidores externos. As respostas apresentadas são
              exclusivamente editoriais. Qualquer integração futura com o assistente Jev permanece
              apenas como hipótese conceitual sujeita a testes, validações técnicas e autorização
              prévia. Não há processamento de voz, gravação de áudio nem coleta de dados pessoais
              nesta fase.
            </p>
          </div>
          <p className="text-center text-[11px] text-slate-400">
            Organização Inteligente · Demonstração Técnica Restrita (Preview)
          </p>
        </footer>
      </main>
    </div>
  )
}
