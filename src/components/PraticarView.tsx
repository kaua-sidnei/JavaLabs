import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Terminal,
  XCircle,
} from 'lucide-react';
import type {
  CopilotChatMessage,
  CopilotFinding,
  Difficulty,
  EvaluationResult,
  Exercise,
  ImprovementHint,
  JavaModule,
  LanguageTrack,
} from '../types/javalab';
import type { TrackMetadata } from '../data/extraTracks';
import { CodeEditor } from './CodeEditor';
import { SpreadsheetPreview } from './SpreadsheetPreview';

interface PraticarViewProps {
  activeTrack: LanguageTrack;
  allTracks: TrackMetadata[];
  onSelectTrack: (track: LanguageTrack) => void;
  modules: JavaModule[];
  moduleExercises: Exercise[];
  currentModule: JavaModule;
  currentExercise: Exercise;
  code: string;
  onCodeChange: (nextCode: string) => void;
  onResetCode: () => void;
  onSelectModule: (moduleId: number) => void;
  onSelectExercise: (exerciseId: string) => void;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onReviewWithCopilot: () => void;
  onNextExercise?: () => void;
  hasNextExercise: boolean;
  evaluation: EvaluationResult | null;
  findings: CopilotFinding[];
  enunciadoImprovements: ImprovementHint[];
  qualityScore: number;
  hasAttemptedCurrent: boolean;
  isEvaluating: boolean;
  isReviewing: boolean;
  errorMessage: string | null;
  chatMessages: CopilotChatMessage[];
  onSendChatMessage: (message: string) => void;
  isChatLoading: boolean;
  isSolved: boolean;
}

const DIFFICULTIES: Difficulty[] = ['Fácil', 'Médio', 'Difícil'];

export function PraticarView({
  activeTrack,
  allTracks,
  onSelectTrack,
  modules,
  moduleExercises,
  currentModule,
  currentExercise,
  code,
  onCodeChange,
  onResetCode,
  onSelectModule,
  onSelectExercise,
  onSelectDifficulty,
  onReviewWithCopilot,
  onNextExercise,
  hasNextExercise,
  evaluation,
  findings,
  enunciadoImprovements,
  qualityScore,
  hasAttemptedCurrent,
  isEvaluating,
  isReviewing,
  errorMessage,
  chatMessages,
  onSendChatMessage,
  isChatLoading,
  isSolved,
}: PraticarViewProps) {
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const [chatInput, setChatInput] = useState('');

  const lineCount = code.split('\n').length;
  const activeFileName = currentExercise.fileName || 'Main.java';
  const activeRuntime = currentExercise.runtimeLabel || 'Java 21';

  const handleChatSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed || isChatLoading) return;
    onSendChatMessage(trimmed);
    setChatInput('');
  };

  const displayedImprovements: ImprovementHint[] =
    enunciadoImprovements.length > 0
      ? enunciadoImprovements
      : currentExercise.preloadedImprovements;

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] bg-[#0A0A0B]">
      {/* Compact Workspace Selector Bar (Track, Module, Difficulty, Exercise) */}
      <div className="border-b border-[#1E1E24] bg-[#0F0F12] px-4 py-2 sm:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <label htmlFor="workspace-track-select" className="sr-only">
              Selecionar trilha de linguagem
            </label>
            <select
              id="workspace-track-select"
              value={activeTrack}
              onChange={(e) => onSelectTrack(e.target.value as LanguageTrack)}
              className="rounded-lg border border-[#272730] bg-[#16161B] px-2.5 py-1.5 text-xs font-semibold text-[#F97316] focus:border-[#F97316] focus:outline-none"
            >
              {allTracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>

            <label htmlFor="workspace-module-select" className="sr-only">
              Selecionar módulo
            </label>
            <select
              id="workspace-module-select"
              value={currentModule.id}
              onChange={(e) => onSelectModule(Number(e.target.value))}
              className="max-w-[260px] rounded-lg border border-[#272730] bg-[#16161B] px-2.5 py-1.5 text-xs font-medium text-[#E4E4EA] focus:border-[#F97316] focus:outline-none"
            >
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} · {m.title}
                </option>
              ))}
            </select>

            <label htmlFor="workspace-exercise-select" className="sr-only">
              Selecionar exercício
            </label>
            <select
              id="workspace-exercise-select"
              value={currentExercise.id}
              onChange={(e) => onSelectExercise(e.target.value)}
              className="max-w-[260px] rounded-lg border border-[#272730] bg-[#16161B] px-2.5 py-1.5 text-xs font-medium text-[#E4E4EA] focus:border-[#F97316] focus:outline-none"
            >
              {moduleExercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  Ex {ex.orderInModule} · {ex.title} ({ex.difficulty})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              role="group"
              aria-label="Selecionar nível de dificuldade"
              className="flex items-center gap-1 rounded-lg border border-[#26262F] bg-[#141418] p-0.5"
            >
              {DIFFICULTIES.map((diff) => {
                const active = currentExercise.difficulty === diff;
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => onSelectDifficulty(diff)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[#F97316] text-[#0A0A0B] font-semibold'
                        : 'text-[#9494A3] hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>

            {hasNextExercise && onNextExercise && (
              <button
                type="button"
                onClick={onNextExercise}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#A1A1AF] hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                <span>Próximo</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3-Column IDE Split matching Page 3 of JavaLab PDF */}
      <div className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 lg:grid-cols-[355px_1fr_345px] divide-y lg:divide-y-0 lg:divide-x divide-[#222228]">
        {/* LEFT COLUMN: Enunciado + Exemplos + Requisitos + O que melhorar */}
        <aside className="flex flex-col bg-[#111114] p-5 overflow-y-auto lg:max-h-[calc(100vh-6.75rem)]">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`font-semibold ${
                currentExercise.difficulty === 'Fácil'
                  ? 'text-[#4ADE80]'
                  : currentExercise.difficulty === 'Médio'
                  ? 'text-[#FBBF24]'
                  : 'text-[#F87171]'
              }`}
            >
              {currentExercise.difficulty}
            </span>
            <span aria-hidden="true" className="text-[#4B4B57]">
              ·
            </span>
            <span className="text-[#9494A3]">{currentModule.title}</span>
            <span aria-hidden="true" className="text-[#4B4B57]">
              ·
            </span>
            <span className="text-[#8C8C9B] tabular-nums">
              ~{currentExercise.estimatedMinutes} min
            </span>
            {isSolved && (
              <>
                <span aria-hidden="true" className="text-[#4B4B57]">
                  ·
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-[#4ADE80]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Resolvido
                </span>
              </>
            )}
          </div>

          <h1 className="mt-2.5 font-display text-xl font-bold text-white leading-snug">
            {currentExercise.title}
          </h1>

          <p className="mt-2.5 text-[13px] text-[#C4C4D0] leading-relaxed">
            {currentExercise.prompt}
          </p>

          {currentExercise.formula && (
            <div className="mt-3 rounded-lg border border-[#24242D] bg-[#16161B] px-3 py-2 font-mono text-xs text-[#E4E4EA]">
              {currentExercise.formula}
            </div>
          )}

          {/* Planilha / Tabela fornecida pelo site (Planilhas GAS / Scraping / Pandas) */}
          {currentExercise.datasetTable && (
            <SpreadsheetPreview
              datasetTable={currentExercise.datasetTable}
              track={currentExercise.track}
            />
          )}

          {/* Exemplos */}
          <div className="mt-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[#7C7C8C]">
              Exemplos
            </h2>
            <div className="mt-2 overflow-hidden rounded-lg border border-[#22222A] bg-[#0D0D10]">
              <table className="w-full text-left text-xs font-mono tabular-nums">
                <thead>
                  <tr className="border-b border-[#22222A] text-[11px] text-[#7C7C8C]">
                    <th className="px-3 py-2 font-medium">Entrada</th>
                    <th className="px-3 py-2 font-medium">Saída esperada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1C22]">
                  {currentExercise.examples.map((ex, i) => (
                    <tr key={i} className="align-top">
                      <td className="px-3 py-2 text-[#D4D4DC] whitespace-pre-wrap">
                        {ex.input}
                      </td>
                      <td className="px-3 py-2 text-[#E4E4EA] whitespace-pre-wrap">
                        {ex.expectedOutput}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Requisitos */}
          <div className="mt-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[#7C7C8C]">
              Requisitos
            </h2>
            <ul className="mt-2 space-y-1.5 text-xs text-[#B4B4C2]">
              {currentExercise.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span aria-hidden="true" className="mt-1.5 h-1 w-1 rounded-full bg-[#6E6E7E] shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* O que melhorar — sempre visível logo no enunciado */}
          <div className="mt-6 rounded-xl border border-[#2A2A35] bg-[#15151A] p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#F97316]" />
                <h2 className="text-xs font-semibold text-white">O que melhorar</h2>
              </div>
              <span className="text-[11px] text-[#7C7C8C]">
                {hasAttemptedCurrent ? 'da última tentativa' : 'pontos do enunciado'}
              </span>
            </div>

            {displayedImprovements.length === 0 ? (
              <p className="mt-2.5 text-xs text-[#4ADE80]">
                Nenhum ponto pendente detectado. Seu código segue boas práticas de {activeRuntime}.
              </p>
            ) : (
              <ol className="mt-3 space-y-2.5">
                {displayedImprovements.map((item, idx) => {
                  const colorClass =
                    item.severity === 'ERRO'
                      ? 'text-[#F87171]'
                      : item.severity === 'AVISO'
                      ? 'text-[#FBBF24]'
                      : 'text-[#60A5FA]';
                  return (
                    <li key={`${item.title}-${idx}`} className="text-xs leading-relaxed">
                      <button
                        type="button"
                        onClick={() => {
                          if (item.line) setHighlightedLine(item.line);
                        }}
                        className="text-left group w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F97316] rounded"
                      >
                        <span className={`font-medium ${colorClass} group-hover:underline`}>
                          {idx + 1}. {item.title}
                        </span>
                        {item.line ? (
                          <span className="ml-1.5 text-[#7C7C8C] tabular-nums">
                            · linha {item.line}
                          </span>
                        ) : null}
                        <p className="mt-0.5 text-[11px] text-[#8C8C9B]">{item.detail}</p>
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </aside>

        {/* CENTER COLUMN: Code Editor + Console */}
        <section className="flex flex-col bg-[#0B0B0D] min-w-0 lg:max-h-[calc(100vh-6.75rem)]">
          {/* Editor Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1F1F26] bg-[#101013] px-4 py-2.5">
            <div className="flex items-center gap-3 text-xs">
              <span className="font-mono font-medium text-white">{activeFileName}</span>
              <span className="text-[#7C7C8C] tabular-nums">
                {activeRuntime} · {lineCount} linhas
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onReviewWithCopilot}
                disabled={isReviewing || isEvaluating}
                className="text-xs font-medium text-[#60A5FA] hover:text-[#93C5FD] disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {isReviewing ? 'Revisando...' : 'Revisar com Copilot'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setHighlightedLine(null);
                  onResetCode();
                }}
                className="inline-flex items-center gap-1 text-xs text-[#8C8C9B] hover:text-white transition-colors whitespace-nowrap"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Resetar</span>
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <CodeEditor
            value={code}
            onChange={(val) => {
              setHighlightedLine(null);
              onCodeChange(val);
            }}
            findings={findings}
            highlightedLine={highlightedLine}
            track={currentExercise.track}
            fileName={activeFileName}
          />

          {/* Console Output */}
          <div className="border-t border-[#22222A] bg-[#0E0E11] flex flex-col max-h-[260px] min-h-[160px]">
            <div className="flex items-center justify-between border-b border-[#1C1C22] px-4 py-2 text-xs">
              <div className="flex items-center gap-2 font-medium text-[#E4E4EA]">
                <Terminal className="h-3.5 w-3.5 text-[#8C8C9B]" />
                <span>Console</span>
              </div>
              <span className="text-[11px] text-[#7C7C8C] tabular-nums">
                {isEvaluating
                  ? 'Compilando e executando casos de teste...'
                  : evaluation
                  ? evaluation.allPassed
                    ? 'Todos os casos de teste passaram'
                    : evaluation.compiled
                    ? 'Divergência nos casos de teste'
                    : 'Erro de compilação'
                  : 'Nenhuma execução ainda'}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
              {errorMessage && (
                <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {!evaluation && !errorMessage && (
                <p className="text-[#6E6E7E]">
                  // Clique em Executar para rodar com os casos de teste ou Ctrl+Enter.
                </p>
              )}

              {evaluation && !evaluation.compiled && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-400 font-semibold">
                    <XCircle className="h-4 w-4" />
                    <span>Erro de validação / execução ({activeRuntime})</span>
                  </div>
                  <pre className="whitespace-pre-wrap text-red-300/90 bg-red-950/30 border border-red-500/20 rounded p-2.5">
                    {evaluation.compileError || evaluation.summary}
                  </pre>
                </div>
              )}

              {evaluation && evaluation.compiled && (
                <div className="space-y-3">
                  <p className="text-[#C4C4D0]">{evaluation.summary}</p>
                  <div className="space-y-2">
                    {evaluation.testResults.map((tc) => (
                      <div
                        key={tc.index}
                        className={`rounded-lg border p-2.5 ${
                          tc.passed
                            ? 'border-emerald-500/25 bg-emerald-500/5'
                            : 'border-red-500/25 bg-red-500/5'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-white tabular-nums">
                            Caso #{tc.index + 1}
                          </span>
                          <span
                            className={`text-[11px] font-semibold ${
                              tc.passed ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {tc.passed ? 'PASSOU' : 'FALHOU'}
                          </span>
                        </div>
                        <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                          <div>
                            <span className="text-[#7C7C8C] block">Entrada:</span>
                            <span className="text-[#D4D4DC] whitespace-pre-wrap">{tc.input}</span>
                          </div>
                          <div>
                            <span className="text-[#7C7C8C] block">Esperado:</span>
                            <span className="text-[#D4D4DC] whitespace-pre-wrap">
                              {tc.expectedOutput}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#7C7C8C] block">Obtido:</span>
                            <span
                              className={`whitespace-pre-wrap ${
                                tc.passed ? 'text-emerald-300' : 'text-red-300'
                              }`}
                            >
                              {tc.error ? tc.error : tc.actualOutput || '(vazio)'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Copilot Review & Chat */}
        <aside className="flex flex-col bg-[#111114] lg:max-h-[calc(100vh-6.75rem)]">
          {/* Copilot Header + Quality Score */}
          <div className="flex items-start justify-between gap-3 border-b border-[#22222A] px-5 py-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#60A5FA]" />
                <h2 className="font-display text-sm font-bold text-white">Copilot</h2>
              </div>
              <p className="mt-0.5 text-[11px] text-[#8C8C9B]">
                {hasAttemptedCurrent ? 'Revisão da última tentativa' : 'Análise estática em tempo real'}
              </p>
            </div>

            <div className="text-right tabular-nums">
              <p
                className={`font-display text-2xl font-bold leading-none ${
                  qualityScore >= 80
                    ? 'text-[#4ADE80]'
                    : qualityScore >= 55
                    ? 'text-[#FBBF24]'
                    : 'text-[#F87171]'
                }`}
              >
                {qualityScore}
              </p>
              <p className="mt-0.5 text-[10px] text-[#7C7C8C]">qualidade / 100</p>
            </div>
          </div>

          {/* Scrollable Findings + Chat Thread */}
          <div className="flex-1 overflow-y-auto p-4 pb-6 space-y-2.5">
            {findings.length === 0 ? (
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 text-xs text-emerald-300">
                <p className="font-semibold">Código limpo e idiomático!</p>
                <p className="mt-1 text-emerald-200/80 leading-relaxed">
                  Nenhum erro ou aviso estrutural encontrado. Você pode enviar sua solução ou
                  perguntar ao Copilot sobre otimizações.
                </p>
              </div>
            ) : (
              findings.map((finding) => (
                <div
                  key={finding.id}
                  className="rounded-xl border border-[#24242D] bg-[#16161B] p-3 hover:border-[#343440] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <span
                        className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase ${
                          finding.severity === 'ERRO'
                            ? 'bg-red-500/15 text-red-400'
                            : finding.severity === 'AVISO'
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-blue-500/15 text-blue-400'
                        }`}
                      >
                        {finding.severity}
                      </span>
                      <h3 className="text-xs font-semibold text-white leading-snug">
                        {finding.title}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => setHighlightedLine(finding.line)}
                      className="shrink-0 font-mono text-[11px] text-[#7C7C8C] hover:text-[#F97316] transition-colors tabular-nums"
                      title={`Ir para linha ${finding.line}`}
                    >
                      L{finding.line}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-[#9E9EAE] leading-relaxed">
                    {finding.explanation}
                  </p>

                  {finding.suggestionCode && (
                    <pre className="mt-2.5 overflow-x-auto rounded-lg border border-[#22222A] bg-[#0B0B0D] px-3 py-2 font-mono text-[11px] text-[#4ADE80]">
                      {finding.suggestionCode}
                    </pre>
                  )}
                </div>
              ))
            )}

            {/* Chat Conversation Messages */}
            {chatMessages.length > 0 && (
              <div className="pt-3 border-t border-[#22222A] space-y-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7C7C8C]">
                  Conversa com o Copilot
                </p>
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-lg p-3 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#1D1D24] text-white ml-4'
                        : 'border border-[#262632] bg-[#141419] text-[#D4D4DC] mr-2 whitespace-pre-wrap'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
                {isChatLoading && (
                  <p className="text-xs text-[#8C8C9B]">Copilot está analisando seu código...</p>
                )}
              </div>
            )}
          </div>

          {/* Ask Copilot Input */}
          <form
            onSubmit={handleChatSubmit}
            className="border-t border-[#22222A] bg-[#0E0E11] p-3"
          >
            <div className="flex items-center gap-2">
              <label htmlFor="copilot-chat-input" className="sr-only">
                Pergunte ao Copilot sobre seu código
              </label>
              <input
                id="copilot-chat-input"
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Pergunte ao Copilot sobre seu código..."
                className="flex-1 rounded-lg border border-[#26262F] bg-[#16161B] px-3 py-2 text-xs text-white placeholder:text-[#6E6E7E] focus:border-[#60A5FA] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isChatLoading}
                aria-label="Enviar pergunta ao Copilot"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#60A5FA] text-[#0A0A0B] hover:bg-[#93C5FD] disabled:opacity-40 transition-colors"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
}
