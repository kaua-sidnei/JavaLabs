import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    message: '',
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let readable = error.message || 'Ocorreu um erro inesperado na aplicação.';
    try {
      const parsed = JSON.parse(error.message) as { error?: string; operationType?: string; path?: string };
      if (parsed && typeof parsed.error === 'string') {
        readable = `Erro de sincronização (${parsed.operationType ?? 'op'} em ${parsed.path ?? 'firestore'}): ${parsed.error}`;
      }
    } catch {
      // Plain error message
    }
    return {
      hasError: true,
      message: readable,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('JavaLabs ErrorBoundary:', error, info.componentStack);
  }

  handleRecover = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0B] text-[#F4F4F6] flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-xl border border-[#2A2A32] bg-[#141417] p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#F97316]">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <h1 className="font-display text-lg font-semibold text-white">
                Algo interrompeu a sessão
              </h1>
            </div>
            <p className="text-sm text-[#A1A1AA] leading-relaxed break-words">
              {this.state.message}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleRecover}
                className="inline-flex items-center gap-2 rounded-lg bg-[#F97316] px-4 py-2 text-xs font-semibold text-[#0A0A0B] hover:bg-[#FB923C] transition-colors whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Tentar novamente</span>
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center rounded-lg border border-[#2A2A32] bg-[#1B1B20] px-4 py-2 text-xs font-medium text-[#E4E4EA] hover:bg-[#23232A] transition-colors whitespace-nowrap"
              >
                Recarregar página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
