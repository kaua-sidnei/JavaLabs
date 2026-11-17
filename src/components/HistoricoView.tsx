import { useState } from 'react';
import { ArrowUpRight, CheckCircle2, XCircle } from 'lucide-react';
import type { Difficulty, LanguageTrack, SubmissionRecord } from '../types/javalab';

interface HistoricoViewProps {
  submissions: SubmissionRecord[];
  onReopenSubmission: (record: SubmissionRecord) => void;
}

const TRACK_LABELS: Record<LanguageTrack, string> = {
  java: 'Java',
  javascript: 'JavaScript',
  appscript: 'Apps Script',
  python: 'Python',
};

export function HistoricoView({
  submissions,
  onReopenSubmission,
}: HistoricoViewProps) {
  const [trackFilter, setTrackFilter] = useState<LanguageTrack | 'Todas'>('Todas');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'Todas'>('Todas');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Aprovados' | 'Revisar'>('Todos');

  const filtered = submissions.filter((sub) => {
    const subTrack = sub.track ?? 'java';
    if (trackFilter !== 'Todas' && subTrack !== trackFilter) return false;
    if (difficultyFilter !== 'Todas' && sub.difficulty !== difficultyFilter) return false;
    if (statusFilter === 'Aprovados' && !sub.passed) return false;
    if (statusFilter === 'Revisar' && sub.passed) return false;
    return true;
  });

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-medium text-[#F97316]">Registro iterativo</p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-white">
            Histórico de envios
          </h1>
          <p className="mt-1.5 text-sm text-[#9494A3]">
            Reabra qualquer tentativa anterior no editor para aplicar as melhorias sugeridas pelo
            Copilot.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-[#24242B] bg-[#141417] p-1">
            {(['Todas', 'java', 'javascript', 'appscript', 'python'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTrackFilter(t)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  trackFilter === t
                    ? 'bg-[#26262F] text-white'
                    : 'text-[#9494A3] hover:text-white'
                }`}
              >
                {t === 'Todas' ? 'Todas trilhas' : TRACK_LABELS[t]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-[#24242B] bg-[#141417] p-1">
            {(['Todas', 'Fácil', 'Médio', 'Difícil'] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficultyFilter(diff)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  difficultyFilter === diff
                    ? 'bg-[#F97316] text-[#0A0A0B] font-semibold'
                    : 'text-[#9494A3] hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-[#24242B] bg-[#141417] p-1">
            {(['Todos', 'Aprovados', 'Revisar'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  statusFilter === st
                    ? 'bg-[#26262F] text-white'
                    : 'text-[#9494A3] hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[#24242B] bg-[#141417] p-12 text-center">
          <p className="text-sm text-[#9494A3]">
            Nenhuma tentativa encontrada com os filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#24242B] bg-[#141417]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#22222A] text-[11px] uppercase tracking-wider text-[#7C7C8C]">
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Módulo / Exercício</th>
                <th className="px-4 py-3 font-medium">Nível</th>
                <th className="px-4 py-3 font-medium">Testes</th>
                <th className="px-4 py-3 font-medium">Copilot</th>
                <th className="px-4 py-3 font-medium">Principal melhoria</th>
                <th className="px-4 py-3 font-medium text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E25]">
              {filtered.map((sub) => {
                const topImprovement =
                  sub.improvementsForEnunciado[0]?.title ||
                  sub.findings[0]?.title ||
                  'Código aprovado sem pendências';
                const trackName = TRACK_LABELS[sub.track ?? 'java'];

                return (
                  <tr
                    key={sub.id}
                    className="hover:bg-[#19191F] transition-colors"
                  >
                    <td className="px-4 py-3.5 text-[#8C8C9B] tabular-nums whitespace-nowrap">
                      {formatDate(sub.timestamp)}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-white">{sub.exerciseTitle}</p>
                      <p className="text-[11px] text-[#7C7C8C]">
                        {trackName} · {sub.moduleTitle}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          sub.difficulty === 'Fácil'
                            ? 'text-[#4ADE80]'
                            : sub.difficulty === 'Médio'
                            ? 'text-[#FBBF24]'
                            : 'text-[#F87171]'
                        }`}
                      >
                        {sub.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap tabular-nums">
                      <span
                        className={`inline-flex items-center gap-1.5 font-medium ${
                          sub.passed ? 'text-[#4ADE80]' : 'text-[#F87171]'
                        }`}
                      >
                        {sub.passed ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                        {sub.testsPassed}/{sub.testsTotal}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono font-semibold tabular-nums text-white">
                      {sub.qualityScore}/100
                    </td>
                    <td className="px-4 py-3.5 text-[#A1A1AF] max-w-[260px] truncate">
                      {topImprovement}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onReopenSubmission(sub)}
                        className="inline-flex items-center gap-1 rounded-md border border-[#2A2A34] bg-[#1C1C23] px-2.5 py-1 text-xs font-medium text-[#E4E4EA] hover:border-[#F97316] hover:text-white transition-colors"
                      >
                        <span>Reabrir</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

