import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  AlertCircle,
  CheckCircle2,
  Cloud,
  CloudOff,
  ExternalLink,
  Loader2,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import type { CloudSyncStatus } from '../hooks/useAuthProgress';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  isAuthenticating: boolean;
  syncStatus: CloudSyncStatus;
  lastSyncedAt: string | null;
  solvedCount: number;
  cloudActivityCount: number;
  authError: string | null;
  syncError: string | null;
  onLoginGoogle: () => Promise<boolean>;
  onLogout: () => Promise<void>;
  onResync: () => Promise<void>;
  onResetProgress: () => Promise<boolean>;
  onClearError: () => void;
}

function formatSyncTime(iso: string | null): string {
  if (!iso) return 'Ainda não sincronizado';
  try {
    return new Date(iso).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return 'Agora';
  }
}

export function AuthModal({
  isOpen,
  onClose,
  user,
  isAuthenticating,
  syncStatus,
  lastSyncedAt,
  solvedCount,
  cloudActivityCount,
  authError,
  syncError,
  onLoginGoogle,
  onLogout,
  onResync,
  onResetProgress,
  onClearError,
}: AuthModalProps) {
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setConfirmingReset(false);
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isBusy = isAuthenticating || syncStatus === 'syncing' || isResetting;
  const activeError = authError || syncError;
  const appUrl = typeof window !== 'undefined' ? window.location.href : '';
  const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;
  const initials = (user?.displayName || user?.email || 'J')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative w-full max-w-md rounded-xl border border-[#27272F] bg-[#141417] p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar janela de conta"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-[#8C8C9B] hover:bg-[#1E1E24] hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {!user ? (
          <div className="space-y-5">
            <div className="flex items-start gap-3 pr-8">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#F97316]/30 bg-[#F97316]/10 text-[#F97316]">
                <Cloud className="h-5 w-5" />
              </div>
              <div>
                <h2
                  id="auth-modal-title"
                  className="font-display text-lg font-bold tracking-tight text-white"
                >
                  Sincronizar progresso na nuvem
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-[#9494A3]">
                  Entre com sua conta Google para salvar pontuações, histórico e códigos no Cloud Firestore.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-[#222228] bg-[#0E0E11] p-4 space-y-2.5 text-xs text-[#C4C4CE]">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22C55E]" />
                <span>Mescla seu progresso atual do navegador sem perder Java 21 ou outras trilhas.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22C55E]" />
                <span>Retome qualquer exercício e código salvo em outros dispositivos.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#F97316]" />
                <span>Dados isolados exclusivamente para sua conta autenticada.</span>
              </div>
            </div>

            {activeError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/10 p-3 text-xs text-[#FCA5A5]"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#F87171]" />
                <div className="flex-1 leading-relaxed">{activeError}</div>
              </div>
            )}

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                disabled={isBusy}
                onClick={async () => {
                  onClearError();
                  const ok = await onLoginGoogle();
                  if (ok) {
                    onClose();
                  }
                }}
                className="w-full inline-flex items-center justify-center gap-2.5 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#0A0A0B] hover:bg-[#F4F4F6] disabled:opacity-60 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                {isBusy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#0A0A0B]" />
                    <span>Conectando ao Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.37 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                      />
                    </svg>
                    <span>Continuar com Google</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-lg border border-[#27272F] bg-transparent px-4 py-2 text-xs font-medium text-[#A1A1AA] hover:bg-[#1B1B20] hover:text-white transition-colors"
              >
                Continuar sem login (apenas navegador local)
              </button>

              {(isInsideIframe || Boolean(activeError)) && appUrl && (
                <a
                  href={appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#F97316] hover:bg-[#F97316]/10 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Abrir aplicativo em uma nova aba</span>
                </a>
              )}

              <div className="pt-2 border-t border-[#222228]">
                {!confirmingReset ? (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => setConfirmingReset(true)}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#8C8C9B] hover:bg-[#1B1B20] hover:text-[#FCA5A5] transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Resetar progresso salvo neste navegador</span>
                  </button>
                ) : (
                  <div className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 p-3 space-y-2">
                    <p className="text-[11px] leading-relaxed text-[#FCA5A5]">
                      Isso apagará atividades concluídas, histórico e rascunhos locais deste navegador.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={async () => {
                          setIsResetting(true);
                          await onResetProgress();
                          setIsResetting(false);
                          setConfirmingReset(false);
                        }}
                        className="flex-1 rounded-md bg-[#EF4444] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#DC2626] disabled:opacity-50 transition-colors"
                      >
                        {isResetting ? 'Resetando...' : 'Confirmar reset'}
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => setConfirmingReset(false)}
                        className="rounded-md border border-[#2A2A32] bg-[#141417] px-2.5 py-1.5 text-xs font-medium text-[#A1A1AA] hover:text-white transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-3 pr-8">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName ?? 'Foto do usuário'}
                  referrerPolicy="no-referrer"
                  className="h-11 w-11 rounded-full border border-[#2A2A32] object-cover shrink-0"
                />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#F97316]/40 bg-[#F97316]/15 font-display text-sm font-bold text-[#F97316]">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <h2
                  id="auth-modal-title"
                  className="truncate font-display text-base font-bold text-white"
                >
                  {user.displayName || 'Estudante JavaLabs'}
                </h2>
                <p className="truncate text-xs text-[#9494A3]">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-[#222228] bg-[#0E0E11] p-3">
                <div className="text-[11px] uppercase tracking-wider text-[#71717A]">
                  Concluídas
                </div>
                <div className="mt-1 font-mono text-lg font-semibold text-white tabular-nums">
                  {solvedCount}
                </div>
              </div>
              <div className="rounded-lg border border-[#222228] bg-[#0E0E11] p-3">
                <div className="text-[11px] uppercase tracking-wider text-[#71717A]">
                  Registros na nuvem
                </div>
                <div className="mt-1 font-mono text-lg font-semibold text-white tabular-nums">
                  {cloudActivityCount}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-[#222228] bg-[#0E0E11] px-3.5 py-2.5 text-xs">
              <div className="flex items-center gap-2 text-[#D4D4DC]">
                {syncStatus === 'syncing' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#F97316]" />
                ) : syncStatus === 'error' ? (
                  <CloudOff className="h-3.5 w-3.5 text-[#F87171]" />
                ) : (
                  <Cloud className="h-3.5 w-3.5 text-[#22C55E]" />
                )}
                <span>
                  {syncStatus === 'syncing'
                    ? 'Sincronizando...'
                    : syncStatus === 'error'
                    ? 'Erro ao sincronizar'
                    : 'Firestore conectado'}
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#71717A] tabular-nums">
                {formatSyncTime(lastSyncedAt)}
              </span>
            </div>

            {activeError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/10 p-3 text-xs text-[#FCA5A5]"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#F87171]" />
                <div className="flex-1 leading-relaxed">{activeError}</div>
              </div>
            )}

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => void onResync()}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-[#2A2A32] bg-[#1B1B20] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#23232A] disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                <span>Sincronizar agora</span>
              </button>

              <button
                type="button"
                disabled={isBusy}
                onClick={async () => {
                  await onLogout();
                  onClose();
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-3.5 py-2 text-xs font-semibold text-[#FCA5A5] hover:bg-[#EF4444]/20 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sair</span>
              </button>
            </div>

            <div className="pt-2 border-t border-[#222228]">
              {!confirmingReset ? (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => setConfirmingReset(true)}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#8C8C9B] hover:bg-[#1B1B20] hover:text-[#FCA5A5] transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Resetar progresso da conta</span>
                </button>
              ) : (
                <div className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 p-3 space-y-2">
                  <p className="text-[11px] leading-relaxed text-[#FCA5A5]">
                    Isso apagará todo o histórico, pontuações e códigos salvos desta conta no navegador e na nuvem.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={async () => {
                        setIsResetting(true);
                        const ok = await onResetProgress();
                        setIsResetting(false);
                        setConfirmingReset(false);
                        if (ok) onClose();
                      }}
                      className="flex-1 rounded-md bg-[#EF4444] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#DC2626] disabled:opacity-50 transition-colors"
                    >
                      {isResetting ? 'Limpando nuvem...' : 'Confirmar reset'}
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => setConfirmingReset(false)}
                      className="rounded-md border border-[#2A2A32] bg-[#141417] px-2.5 py-1.5 text-xs font-medium text-[#A1A1AA] hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
