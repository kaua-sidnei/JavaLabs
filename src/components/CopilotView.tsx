import { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import type {
  Difficulty,
  JavaModule,
  LanguageTrack,
  RecurringPattern,
  SubmissionRecord,
} from '../types/javalab';
import type { TrackMetadata } from '../data/extraTracks';

interface CopilotViewProps {
  activeTrack: LanguageTrack;
  allTracks: TrackMetadata[];
  onSelectTrack: (track: LanguageTrack) => void;
  modules: JavaModule[];
  recurringPatterns: RecurringPattern[];
  submissions: SubmissionRecord[];
  onOpenExercise: (exerciseId: string) => void;
  onGenerateExercise: (
    moduleId: number,
    difficulty: Difficulty,
    focusWeakPoints: boolean
  ) => Promise<void>;
  isGenerating: boolean;
  generateError: string | null;
}

const DIFFICULTIES: Difficulty[] = ['Fácil', 'Médio', 'Difícil'];

const FOCUS_HINT_BY_TRACK: Record<LanguageTrack, string> = {
  java: 'Direcionar o enunciado para corrigir meus padrões de melhoria (Locale, printf, fechamento de recursos)',
  javascript: 'Direcionar o enunciado para corrigir meus padrões JS/TS (ES6+, async/Fetch, Generics, Utility Types)',
  appscript: 'Direcionar o enunciado para dados logísticos reais (getValues/setValues em lote, UrlFetchApp, Triggers e Regras)',
  python: 'Direcionar o enunciado para padrões Pythonic (POO, BeautifulSoup/requests, Pandas e FastAPI/Pydantic)',
};

export function CopilotView({
  activeTrack,
  allTracks,
  onSelectTrack,
  modules,
  recurringPatterns,
  submissions,
  onOpenExercise,
  onGenerateExercise,
  isGenerating,
  generateError,
}: CopilotViewProps) {
  const [selectedModuleId, setSelectedModuleId] = useState<number>(() => modules[0]?.id ?? 3);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('Médio');
  const [focusWeakPoints, setFocusWeakPoints] = useState<boolean>(true);

  useEffect(() => {
    if (!modules.some((m) => m.id === selectedModuleId) && modules.length > 0) {
      setSelectedModuleId(modules[0].id);
    }
  }, [modules, selectedModuleId]);

  const activeTrackMeta = allTracks.find((t) => t.id === activeTrack) ?? allTracks[0];

  const avgScore =
    submissions.length > 0
      ? Math.round(
          submissions.reduce((acc, s) => acc + s.qualityScore, 0) / submissions.length
        )
      : 0;

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6">
        <div
          role="tablist"
          aria-label="Filtrar Copilot por linguagem"
          className="mb-5 inline-flex flex-wrap items-center gap-1.5 rounded-xl border border-[#24242B] bg-[#121215] p-1.5"
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
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
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

        <p className="text-xs font-medium text-[#F97316]">Copilot Diagnóstico</p>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-white">
          O que melhorar em {activeTrackMeta.label}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#9494A3]">
          O Copilot consolida os padrões dos seus envios e gera novos enunciados no nível Fácil,
          Médio ou Difícil com pontos de atenção explícitos antes de você codar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Recurring patterns from history */}
        <section className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-white">
              Padrões detectados em {activeTrackMeta.shortLabel}
            </h2>
            <span className="text-xs text-[#8C8C9B] tabular-nums">
              {submissions.length > 0 ? `Média atual: ${avgScore} / 100` : 'Sem envios na trilha ainda'}
            </span>
          </div>

          {recurringPatterns.length === 0 ? (
            <div className="rounded-xl border border-[#24242B] bg-[#141417] p-8 text-center">
              <p className="text-sm text-[#9494A3]">
                Nenhum padrão de erro pendente registrado até agora.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recurringPatterns.map((pattern) => (
                <div
                  key={pattern.id}
                  className="rounded-xl border border-[#24242B] bg-[#141417] p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase ${
                          pattern.severity === 'ERRO'
                            ? 'bg-red-500/15 text-red-400'
                            : pattern.severity === 'AVISO'
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-blue-500/15 text-blue-400'
                        }`}
                      >
                        {pattern.severity}
                      </span>
                      <h3 className="font-display text-sm font-semibold text-white">
                        {pattern.title}
                      </h3>
                    </div>
                    <span className="text-xs text-[#7C7C8C] tabular-nums">
                      {pattern.occurrences} ocorrência{pattern.occurrences > 1 ? 's' : ''}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-[#9E9EAE] leading-relaxed">
                    {pattern.description}
                  </p>

                  {pattern.targetExerciseId && (
                    <button
                      type="button"
                      onClick={() => onOpenExercise(pattern.targetExerciseId!)}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#F97316] hover:text-[#FB923C] transition-colors"
                    >
                      <span>Revisar exercício relacionado</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right: Custom AI Exercise Generator */}
        <section className="lg:col-span-5 rounded-xl border border-[#24242B] bg-[#141417] p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#F97316]" />
            <h2 className="font-display text-base font-bold text-white">
              Gerar desafio sob medida
            </h2>
          </div>
          <p className="mt-1.5 text-xs text-[#9494A3] leading-relaxed">
            Escolha qualquer matéria de {activeTrackMeta.shortLabel} e a dificuldade. O enunciado já
            nasce com a lista de &ldquo;O que melhorar&rdquo; destacada para você treinar.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="copilot-module-select"
                className="block text-xs font-medium text-[#C4C4D0] mb-1.5"
              >
                Matéria / Módulo
              </label>
              <select
                id="copilot-module-select"
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(Number(e.target.value))}
                className="w-full rounded-lg border border-[#272730] bg-[#0D0D10] px-3 py-2 text-xs text-white focus:border-[#F97316] focus:outline-none"
              >
                {modules.map((mod) => (
                  <option key={mod.id} value={mod.id}>
                    {mod.code} · {mod.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-xs font-medium text-[#C4C4D0] mb-1.5">
                Nível de dificuldade
              </span>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map((diff) => {
                  const active = selectedDifficulty === diff;
                  return (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`rounded-lg border py-2 text-xs font-semibold transition-colors ${
                        active
                          ? 'border-[#F97316] bg-[#F97316]/15 text-[#F97316]'
                          : 'border-[#272730] bg-[#0D0D10] text-[#9494A3] hover:text-white'
                      }`}
                    >
                      {diff}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer rounded-lg border border-[#22222A] bg-[#0E0E11] p-3">
              <input
                type="checkbox"
                checked={focusWeakPoints}
                onChange={(e) => setFocusWeakPoints(e.target.checked)}
                className="mt-0.5 rounded border-[#3A3A46] accent-[#F97316]"
              />
              <span className="text-xs text-[#C4C4D0] leading-relaxed">
                {FOCUS_HINT_BY_TRACK[activeTrack]}
              </span>
            </label>

            {generateError && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{generateError}</span>
              </div>
            )}

            <button
              type="button"
              disabled={isGenerating}
              onClick={() =>
                onGenerateExercise(selectedModuleId, selectedDifficulty, focusWeakPoints)
              }
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#F97316] px-4 py-2.5 text-sm font-semibold text-[#0A0A0B] hover:bg-[#FB923C] disabled:opacity-50 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {isGenerating ? 'Gerando exercício com Copilot...' : 'Gerar exercício e abrir editor'}
              </span>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

