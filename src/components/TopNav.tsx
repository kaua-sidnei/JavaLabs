import type { User } from 'firebase/auth';
import { ArrowLeft, Cloud, CloudOff, Code2, Loader2, Play, Send, User as UserIcon } from 'lucide-react';
import type { CloudSyncStatus } from '../hooks/useAuthProgress';
import type { ActiveTab, Exercise, JavaModule } from '../types/javalab';

interface TopNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  streakDays: number;
  currentModule?: JavaModule;
  currentExercise?: Exercise;
  exercisePosition?: number;
  totalInModule?: number;
  hasPreviousExercise?: boolean;
  onPreviousExercise?: () => void;
  onRunTests?: () => void;
  onSubmitSolution?: () => void;
  isEvaluating?: boolean;
  user?: User | null;
  syncStatus?: CloudSyncStatus;
  onOpenAuthModal?: () => void;
}

function AccountButton({
  user,
  syncStatus,
  onClick,
  compact = false,
}: {
  user?: User | null;
  syncStatus?: CloudSyncStatus;
  onClick?: () => void;
  compact?: boolean;
}) {
  const firstName = user?.displayName?.trim().split(/\s+/)[0] || user?.email?.split('@')[0] || 'Conta';

  const statusDot =
    syncStatus === 'syncing' ? (
      <Loader2 className="h-3 w-3 animate-spin text-[#F97316] shrink-0" />
    ) : syncStatus === 'error' ? (
      <CloudOff className="h-3 w-3 text-[#F87171] shrink-0" />
    ) : user ? (
      <span className="h-2 w-2 rounded-full bg-[#22C55E] shrink-0" aria-hidden="true" />
    ) : (
      <Cloud className="h-3.5 w-3.5 text-[#F97316] shrink-0" />
    );

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={user ? `Conta conectada: ${firstName}` : 'Entrar com Google e sincronizar'}
        title={user ? `Conta: ${firstName}` : 'Entrar e sincronizar na nuvem'}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#2A2A32] bg-[#16161B] px-2.5 text-xs font-medium text-[#E4E4EA] hover:border-[#F97316]/50 hover:text-white transition-colors whitespace-nowrap shrink-0"
      >
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt={firstName}
            referrerPolicy="no-referrer"
            className="h-4 w-4 rounded-full object-cover shrink-0"
          />
        ) : (
          <UserIcon className="h-3.5 w-3.5 text-[#A1A1AA] shrink-0" />
        )}
        {statusDot}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg border border-[#27272F] bg-[#141418] px-3 py-1.5 text-xs font-medium text-[#E4E4EA] hover:border-[#F97316]/50 hover:text-white transition-colors whitespace-nowrap shrink-0"
    >
      {user ? (
        <>
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={firstName}
              referrerPolicy="no-referrer"
              className="h-4 w-4 rounded-full object-cover shrink-0"
            />
          ) : (
            <UserIcon className="h-3.5 w-3.5 text-[#A1A1AA] shrink-0" />
          )}
          <span className="max-w-[96px] truncate">{firstName}</span>
          {statusDot}
        </>
      ) : (
        <>
          {statusDot}
          <span>Entrar</span>
        </>
      )}
    </button>
  );
}

export function TopNav({
  activeTab,
  onSelectTab,
  streakDays,
  currentModule,
  currentExercise,
  exercisePosition,
  totalInModule,
  hasPreviousExercise,
  onPreviousExercise,
  onRunTests,
  onSubmitSolution,
  isEvaluating,
  user,
  syncStatus,
  onOpenAuthModal,
}: TopNavProps) {
  if (activeTab === 'praticar' && currentModule && currentExercise) {
    const pos = exercisePosition ?? currentExercise.orderInModule;
    return (
      <header className="sticky top-0 z-30 border-b border-[#222228] bg-[#0D0D0F]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => onSelectTab('trilha')}
              className="flex shrink-0 items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] rounded-md"
              aria-label="Voltar para a Trilha JavaLabs"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F97316] text-[#0A0A0B]">
                <Code2 className="h-4 w-4 stroke-[2.5]" />
              </span>
              <span className="font-display text-base font-bold tracking-tight text-white whitespace-nowrap">
                JavaLabs
              </span>
            </button>

            <nav
              aria-label="Navegação estrutural"
              className="hidden md:flex items-center gap-2 text-xs text-[#9494A3] min-w-0"
            >
              <button
                type="button"
                onClick={() => onSelectTab('trilha')}
                className="hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                Trilha
              </button>
              <span aria-hidden="true" className="text-[#4B4B57]">
                /
              </span>
              <span className="truncate max-w-[220px]">
                {currentModule.code} · {currentModule.title}
              </span>
              <span aria-hidden="true" className="text-[#4B4B57]">
                /
              </span>
              <span className="font-medium text-white whitespace-nowrap shrink-0 tabular-nums">
                Exercício {pos}
                {totalInModule ? ` de ${totalInModule}` : ''}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onPreviousExercise}
              disabled={!hasPreviousExercise || isEvaluating}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#2A2A32] bg-[#16161B] px-3 py-1.5 text-xs font-medium text-[#D4D4DC] hover:bg-[#1E1E25] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Anterior</span>
            </button>

            <button
              type="button"
              onClick={onRunTests}
              disabled={isEvaluating}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#22C55E]/40 bg-[#22C55E]/10 px-3.5 py-1.5 text-xs font-semibold text-[#4ADE80] hover:bg-[#22C55E]/20 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{isEvaluating ? 'Executando...' : 'Executar'}</span>
            </button>

            <button
              type="button"
              onClick={onSubmitSolution}
              disabled={isEvaluating}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#F97316] px-4 py-1.5 text-xs font-semibold text-[#0A0A0B] hover:bg-[#FB923C] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isEvaluating ? 'Analisando...' : 'Enviar solução'}</span>
            </button>

            {onOpenAuthModal && (
              <AccountButton
                user={user}
                syncStatus={syncStatus}
                onClick={onOpenAuthModal}
                compact
              />
            )}
          </div>
        </div>
      </header>
    );
  }

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'trilha', label: 'Trilha' },
    { id: 'praticar', label: 'Praticar' },
    { id: 'copilot', label: 'Copilot' },
    { id: 'historico', label: 'Histórico' },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-[#1E1E24] bg-[#0A0A0B]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-3 sm:gap-8 px-3 sm:px-6">
        {/* Zone 1: Brand wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('trilha')}
          className="flex items-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] rounded-md"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F97316] text-[#0A0A0B]">
            <Code2 className="h-4 w-4 stroke-[2.5]" />
          </span>
          <span className="font-display text-sm sm:text-base font-bold tracking-tight text-white">
            JavaLabs
          </span>
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav aria-label="Navegação principal" className="flex items-center gap-3.5 sm:gap-7">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative py-4 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isActive ? 'text-white' : 'text-[#8C8C9B] hover:text-white'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#F97316]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Streak action + Account sync */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab('praticar')}
            className="hidden md:inline-flex rounded-lg border border-[#27272F] bg-[#141418] px-3.5 py-1.5 text-xs font-medium text-[#E4E4EA] hover:border-[#F97316]/50 hover:text-white transition-colors whitespace-nowrap shrink-0 tabular-nums"
          >
            {streakDays} dias seguidos · Praticar
          </button>

          {onOpenAuthModal && (
            <AccountButton
              user={user}
              syncStatus={syncStatus}
              onClick={onOpenAuthModal}
            />
          )}
        </div>
      </div>
    </header>
  );
}
