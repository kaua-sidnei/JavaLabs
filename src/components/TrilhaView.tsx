import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import type {
  DashboardStats,
  Difficulty,
  Exercise,
  JavaModule,
  LanguageTrack,
  ModuleCategory,
  RecommendedMaterial,
  RecurringPattern,
} from '../types/javalab';
import type { TrackMetadata } from '../data/extraTracks';
import {
  computeModuleProgress,
  filterModules,
  getModuleExercisesByDifficulty,
} from '../utils/labLogic';
import { SpreadsheetPreview } from './SpreadsheetPreview';

interface TrilhaViewProps {
  activeTrack: LanguageTrack;
  onSelectTrack: (track: LanguageTrack) => void;
  trackMeta: TrackMetadata;
  allTracks: TrackMetadata[];
  modules: JavaModule[];
  exercises: Exercise[];
  solvedIds: Set<string>;
  stats: DashboardStats;
  continueExercise: Exercise;
  continueModule: JavaModule;
  recurringPatterns: RecurringPattern[];
  recommendedMaterials: RecommendedMaterial[];
  difficultyFilter: Difficulty | 'Todas';
  onDifficultyFilterChange: (diff: Difficulty | 'Todas') => void;
  onOpenExercise: (exerciseId: string) => void;
  onNavigateCopilot: () => void;
  onGenerateForModule: (moduleId: number, difficulty: Difficulty) => void;
  isGeneratingExercise: boolean;
}

const DIFFICULTIES: { id: Difficulty | 'Todas'; label: string }[] = [
  { id: 'Todas', label: 'Todas' },
  { id: 'Fácil', label: 'Fácil' },
  { id: 'Médio', label: 'Médio' },
  { id: 'Difícil', label: 'Difícil' },
];

export function TrilhaView({
  activeTrack,
  onSelectTrack,
  trackMeta,
  allTracks,
  modules,
  exercises,
  solvedIds,
  stats,
  continueExercise,
  continueModule,
  recurringPatterns,
  recommendedMaterials,
  difficultyFilter,
  onDifficultyFilterChange,
  onOpenExercise,
  onNavigateCopilot,
  onGenerateForModule,
  isGeneratingExercise,
}: TrilhaViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<ModuleCategory | 'Todos'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedModule, setInspectedModule] = useState<JavaModule | null>(null);

  useEffect(() => {
    setSelectedCategory('Todos');
    setSearchQuery('');
    setInspectedModule(null);
  }, [activeTrack]);

  const categories = useMemo(() => {
    const counts = new Map<ModuleCategory, number>();
    for (const mod of modules) {
      counts.set(mod.category, (counts.get(mod.category) ?? 0) + 1);
    }
    const items: { id: ModuleCategory | 'Todos'; label: string }[] = [
      { id: 'Todos', label: `Todos · ${modules.length}` },
    ];
    for (const [cat, count] of counts.entries()) {
      items.push({ id: cat, label: `${cat} · ${count}` });
    }
    return items;
  }, [modules]);

  const visibleModules = filterModules(modules, selectedCategory, searchQuery);
  const continueModuleProgress = computeModuleProgress(
    continueModule.id,
    exercises,
    solvedIds
  );

  const inspectedExercises = inspectedModule
    ? getModuleExercisesByDifficulty(exercises, inspectedModule.id, difficultyFilter)
    : [];

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10">
      {/* Language Track Selector on Home Screen */}
      <section aria-label="Selecionar trilha de linguagem" className="mb-6">
        <div
          role="tablist"
          aria-label="Trilhas de estudo"
          className="inline-flex flex-wrap items-center gap-1.5 rounded-xl border border-[#24242B] bg-[#121215] p-1.5"
        >
          {allTracks.map((t) => {
            const isActive = t.id === activeTrack;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelectTrack(t.id)}
                className={`rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#F97316] text-[#0A0A0B]'
                    : 'text-[#A1A1AF] hover:bg-[#1C1C23] hover:text-white'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Hero Headline */}
      <section className="mb-8">
        <p className="mb-2 text-xs font-medium tracking-wide text-[#8C8C9B]">
          {trackMeta.eyebrow}
        </p>
        <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white max-w-3xl leading-[1.12] [text-wrap:balance]">
          {trackMeta.heroTitleStart}{' '}
          <span className="text-[#F97316]">{trackMeta.heroTitleAccent}</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm sm:text-base text-[#9494A3] leading-relaxed">
          {trackMeta.heroSubtitle}
        </p>
      </section>

      {/* Top 2-Column Split: Continue Card + Copilot Patterns */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6 items-stretch">
        {/* Left: Continue Card */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-xl border border-[#24242B] bg-[#141417] p-6">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold tracking-wider text-[#F97316] uppercase">
                Continue de onde parou
              </span>
              <span className="text-[#8C8C9B]">
                Módulo {continueModule.code} · {continueModule.title}
              </span>
            </div>

            <div className="mt-3">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white leading-snug">
                Exercício {continueExercise.orderInModule} · {continueExercise.title}
                <span className="ml-2 font-sans text-xs font-medium text-[#9494A3] align-middle whitespace-nowrap">
                  · {continueExercise.difficulty}
                </span>
              </h2>
            </div>

            <p className="mt-1.5 text-sm text-[#A1A1AF] leading-relaxed">
              {continueExercise.prompt}
            </p>

            {continueExercise.datasetTable && (
              <SpreadsheetPreview
                datasetTable={continueExercise.datasetTable}
                track={activeTrack}
                compact
              />
            )}

            <pre className="mt-4 overflow-x-auto rounded-lg border border-[#22222A] bg-[#0B0B0D] px-4 py-3 font-mono text-xs text-[#D4D4DC] leading-relaxed">
              {trackMeta.snippetPreview}
            </pre>

            {continueExercise.preloadedImprovements.length > 0 && (
              <div className="mt-3 rounded-lg border border-[#22222A] bg-[#101014] px-3.5 py-2.5 text-xs text-[#A1A1AF]">
                <span className="font-semibold text-[#F97316]">O que melhorar no enunciado: </span>
                <span>
                  {continueExercise.preloadedImprovements
                    .slice(0, 2)
                    .map((item) => item.title)
                    .join(' · ')}
                </span>
              </div>
            )}
          </div>

          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between text-xs text-[#9494A3] tabular-nums">
              <span>
                {continueModuleProgress.solved} de {continueModuleProgress.total} exercícios
              </span>
              <span className="font-semibold text-white">{continueModuleProgress.percent}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#23232A]">
              <div
                className="h-full rounded-full bg-[#F97316] transition-all duration-300"
                style={{ width: `${continueModuleProgress.percent}%` }}
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onOpenExercise(continueExercise.id)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#F97316] px-4 py-2.5 text-sm font-semibold text-[#0A0A0B] hover:bg-[#FB923C] transition-colors whitespace-nowrap"
              >
                <span>Continuar codando</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setInspectedModule(continueModule)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#2A2A32] bg-[#1A1A20] px-4 py-2.5 text-sm font-medium text-[#E4E4EA] hover:bg-[#22222A] transition-colors whitespace-nowrap"
              >
                <span>Ver módulo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Copilot Recurring Improvements */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-[#24242B] bg-[#141417] p-6">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-bold text-white">
                  Copilot · o que melhorar
                </h2>
                <p className="mt-0.5 text-xs text-[#8C8C9B]">
                  Pontos críticos de atenção em {trackMeta.shortLabel}
                </p>
              </div>
              <Sparkles className="h-4 w-4 text-[#F97316] shrink-0 mt-0.5" />
            </div>

            <div className="mt-4 space-y-3">
              {recurringPatterns.slice(0, 3).map((pattern) => (
                <div
                  key={pattern.id}
                  className="rounded-lg border border-[#22222A] bg-[#0E0E11] p-3"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`font-mono text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                        pattern.severity === 'ERRO'
                          ? 'bg-red-500/15 text-red-400'
                          : pattern.severity === 'AVISO'
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-blue-500/15 text-blue-400'
                      }`}
                    >
                      {pattern.severity}
                    </span>
                    <span className="font-semibold text-white">{pattern.title}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-[#9494A3] leading-relaxed">
                    {pattern.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#22222A]">
            <button
              type="button"
              onClick={onNavigateCopilot}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F97316] hover:text-[#FB923C] transition-colors"
            >
              <span>Praticar esses pontos</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 4-Column KPI Strip */}
      <section
        aria-label="Indicadores de progresso"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
      >
        <div className="rounded-xl border border-[#24242B] bg-[#141417] p-5">
          <p className="text-xs text-[#8C8C9B]">Exercícios resolvidos ({trackMeta.shortLabel})</p>
          <p className="mt-2 font-display text-2xl font-bold text-white tabular-nums">
            {stats.solvedCount}{' '}
            <span className="text-sm font-normal text-[#717182]">/ {stats.totalExercises}</span>
          </p>
        </div>

        <div className="rounded-xl border border-[#24242B] bg-[#141417] p-5">
          <p className="text-xs text-[#8C8C9B]">Módulos concluídos</p>
          <p className="mt-2 font-display text-2xl font-bold text-white tabular-nums">
            {stats.completedModules}{' '}
            <span className="text-sm font-normal text-[#717182]">/ {stats.totalModules}</span>
          </p>
        </div>

        <div className="rounded-xl border border-[#24242B] bg-[#141417] p-5">
          <p className="text-xs text-[#8C8C9B]">Nota média do Copilot</p>
          <p className="mt-2 font-display text-2xl font-bold text-white tabular-nums">
            {stats.averageCopilotScore}{' '}
            <span className="text-sm font-normal text-[#717182]">/ 100</span>
          </p>
        </div>

        <div className="rounded-xl border border-[#24242B] bg-[#141417] p-5">
          <p className="text-xs text-[#8C8C9B]">Progresso na trilha</p>
          <p className="mt-2 font-display text-2xl font-bold text-white tabular-nums">
            {stats.overallProgressPercent}%
          </p>
        </div>
      </section>

      {/* Trilha de Módulos */}
      <section>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-5">
          <div>
            <h2 className="font-display text-xl font-bold text-white">
              Trilha de módulos · {trackMeta.label}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#8C8C9B]">
              Escolha um módulo e pratique nos níveis Fácil, Médio ou Difícil com análise do
              Copilot.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6E6E7E]" />
              <label htmlFor="module-search" className="sr-only">
                Buscar módulo
              </label>
              <input
                id="module-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar módulo..."
                className="w-44 sm:w-52 rounded-lg border border-[#24242B] bg-[#141417] py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-[#6E6E7E] focus:border-[#F97316] focus:outline-none"
              />
            </div>

            {/* Category filter tabs */}
            <div className="flex flex-wrap items-center gap-1 rounded-lg border border-[#24242B] bg-[#121215] p-1">
              {categories.map((cat) => {
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[#26262F] text-white'
                        : 'text-[#8C8C9B] hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Difficulty Filter Strip */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#22222A] bg-[#111114] px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs text-[#9494A3]">
            <span>Filtrar exercícios por dificuldade:</span>
          </div>
          <div className="flex items-center gap-1.5">
            {DIFFICULTIES.map((diff) => {
              const active = difficultyFilter === diff.id;
              return (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => onDifficultyFilterChange(diff.id)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#F97316] text-[#0A0A0B] font-semibold'
                      : 'bg-[#1A1A20] text-[#A1A1AF] hover:text-white'
                  }`}
                >
                  {diff.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Module Cards Grid */}
        {visibleModules.length === 0 ? (
          <div className="rounded-xl border border-[#24242B] bg-[#141417] p-10 text-center">
            <p className="text-sm text-[#9494A3]">
              Nenhum módulo encontrado para &ldquo;{searchQuery}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Todos');
              }}
              className="mt-3 text-xs font-semibold text-[#F97316] hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {visibleModules.map((mod) => {
              const prog = computeModuleProgress(
                mod.id,
                exercises,
                solvedIds,
                difficultyFilter
              );
              const unitLabel = mod.isProject ? 'etapas' : 'exercícios';

              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setInspectedModule(mod)}
                  className="group flex flex-col justify-between rounded-xl border border-[#24242B] bg-[#141417] p-5 text-left hover:border-[#3A3A46] hover:bg-[#18181C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-mono text-[#717182] tabular-nums">{mod.code}</span>
                      <span
                        className={`font-medium ${
                          prog.status === 'Concluído'
                            ? 'text-[#4ADE80]'
                            : prog.status === 'Em andamento'
                            ? 'text-[#FBBF24]'
                            : 'text-[#717182]'
                        }`}
                      >
                        {prog.status}
                      </span>
                    </div>

                    <h3 className="mt-3 font-display text-[15px] font-semibold text-white group-hover:text-[#F97316] transition-colors leading-snug">
                      {mod.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-[#8C8C9B] leading-relaxed">
                      {mod.subtitle}
                    </p>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-[11px] text-[#717182] tabular-nums">
                      <span>{mod.categoryLabel}</span>
                      <span>
                        {prog.solved}/{prog.total} {unitLabel}
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-[#23232A]">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          prog.status === 'Concluído'
                            ? 'bg-[#22C55E]'
                            : prog.status === 'Em andamento'
                            ? 'bg-[#F97316]'
                            : 'bg-transparent'
                        }`}
                        style={{ width: `${prog.percent}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Recommended Study Materials for JS, Apps Script, and Python */}
      {recommendedMaterials.length > 0 && (
        <section aria-label="Materiais recomendados" className="mt-12 pt-8 border-t border-[#1E1E24]">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-4 w-4 text-[#F97316]" />
            <h2 className="font-display text-lg font-bold text-white">
              Materiais recomendados · {trackMeta.label}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedMaterials.map((mat) => (
              <div
                key={mat.id}
                className="rounded-xl border border-[#24242B] bg-[#141417] p-5"
              >
                <p className="text-[11px] text-[#8C8C9B]">{mat.authorOrSource}</p>
                <h3 className="mt-1 font-display text-sm font-semibold text-white">
                  {mat.title}
                </h3>
                <p className="mt-2 text-xs text-[#9E9EAE] leading-relaxed">
                  {mat.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Module Drawer / Modal to pick Fácil, Médio, Difícil exercises */}
      {inspectedModule && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="module-modal-title"
        >
          <div className="w-full max-w-2xl rounded-xl border border-[#2A2A34] bg-[#141417] shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-[#22222A] px-6 py-4">
              <div>
                <p className="text-xs text-[#8C8C9B]">
                  Módulo {inspectedModule.code} · {inspectedModule.lessonsCount} aulas ·{' '}
                  {inspectedModule.durationLabel}
                </p>
                <h2 id="module-modal-title" className="mt-1 font-display text-lg font-bold text-white">
                  {inspectedModule.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setInspectedModule(null)}
                aria-label="Fechar detalhes do módulo"
                className="rounded-lg p-1.5 text-[#8C8C9B] hover:bg-[#22222A] hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-4 border-b border-[#22222A] flex flex-wrap items-center justify-between gap-3 bg-[#101013]">
              <span className="text-xs text-[#9494A3]">Nível do desafio:</span>
              <div className="flex items-center gap-1.5">
                {DIFFICULTIES.map((diff) => {
                  const active = difficultyFilter === diff.id;
                  return (
                    <button
                      key={diff.id}
                      type="button"
                      onClick={() => onDifficultyFilterChange(diff.id)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        active
                          ? 'bg-[#F97316] text-[#0A0A0B] font-semibold'
                          : 'bg-[#1B1B22] text-[#A1A1AF] hover:text-white'
                      }`}
                    >
                      {diff.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="max-h-[55vh] overflow-y-auto divide-y divide-[#22222A]">
              {inspectedExercises.map((ex) => {
                const isSolved = solvedIds.has(ex.id);
                return (
                  <div
                    key={ex.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 hover:bg-[#19191E] transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={`font-semibold ${
                            ex.difficulty === 'Fácil'
                              ? 'text-[#4ADE80]'
                              : ex.difficulty === 'Médio'
                              ? 'text-[#FBBF24]'
                              : 'text-[#F87171]'
                          }`}
                        >
                          {ex.difficulty}
                        </span>
                        <span className="text-[#525260]">·</span>
                        <span className="text-[#8C8C9B] tabular-nums">~{ex.estimatedMinutes} min</span>
                        {ex.datasetTable && (
                          <>
                            <span className="text-[#525260]">·</span>
                            <span className="text-[#9494A3]">Com tabela de dados</span>
                          </>
                        )}
                        {isSolved && (
                          <>
                            <span className="text-[#525260]">·</span>
                            <span className="inline-flex items-center gap-1 text-[#4ADE80] font-medium">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Resolvido
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="mt-1 font-display text-sm font-semibold text-white">
                        Exercício {ex.orderInModule} · {ex.title}
                      </h3>
                      <p className="mt-1 text-xs text-[#9494A3] line-clamp-2">{ex.prompt}</p>
                      {ex.preloadedImprovements.length > 0 && (
                        <p className="mt-1.5 text-[11px] text-[#F97316]">
                          O que melhorar: {ex.preloadedImprovements[0].title}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setInspectedModule(null);
                        onOpenExercise(ex.id);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#F97316] px-3.5 py-2 text-xs font-semibold text-[#0A0A0B] hover:bg-[#FB923C] transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Codar agora</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#22222A] bg-[#101013] px-6 py-3.5">
              <span className="text-xs text-[#8C8C9B]">
                Quer um desafio inédito neste módulo com o Copilot?
              </span>
              <div className="flex items-center gap-2">
                {(['Fácil', 'Médio', 'Difícil'] as Difficulty[]).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    disabled={isGeneratingExercise}
                    onClick={() => {
                      const modId = inspectedModule.id;
                      setInspectedModule(null);
                      onGenerateForModule(modId, diff);
                    }}
                    className="rounded-md border border-[#2A2A34] bg-[#18181E] px-2.5 py-1 text-xs font-medium text-[#E4E4EA] hover:border-[#F97316] hover:text-white disabled:opacity-50 transition-colors"
                  >
                    + Gerar {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

