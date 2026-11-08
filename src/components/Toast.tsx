'use client';

import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  variant: ToastVariant;
  title: string;
  description?: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
  durationMs?: number;
}

/**
 * Dismissible floating notification toast for CSV load confirmations and feedback.
 */
export function Toast({
  toast,
  onDismiss,
  durationMs = 6000,
}: ToastProps) {
  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      onDismiss();
    }, durationMs);

    return () => window.clearTimeout(timer);
  }, [toast, durationMs, onDismiss]);

  if (!toast) return null;

  const styleMap: Record<
    ToastVariant,
    {
      container: string;
      iconColor: string;
      titleColor: string;
    }
  > = {
    success: {
      container:
        'border-reveillon-gold/60 bg-reveillon-charcoal/95 shadow-gold-glow',
      iconColor: 'text-reveillon-gold-bright',
      titleColor: 'text-reveillon-gold-light',
    },
    error: {
      container: 'border-red-500/60 bg-reveillon-charcoal/95 shadow-silver-card',
      iconColor: 'text-red-400',
      titleColor: 'text-red-200',
    },
    info: {
      container:
        'border-reveillon-silver/40 bg-reveillon-charcoal/95 shadow-silver-card',
      iconColor: 'text-reveillon-silver-light',
      titleColor: 'text-reveillon-silver-light',
    },
  };

  const styles = styleMap[toast.variant];

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 w-full max-w-sm px-4 sm:px-0"
    >
      <div
        className={`flex items-start gap-3 rounded-xl border p-4 backdrop-blur-md transition-all ${styles.container}`}
      >
        <div className={`mt-0.5 shrink-0 ${styles.iconColor}`}>
          {toast.variant === 'success' && <CheckCircle2 className="h-5 w-5" />}
          {toast.variant === 'error' && <AlertCircle className="h-5 w-5" />}
          {toast.variant === 'info' && <Info className="h-5 w-5" />}
        </div>

        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold ${styles.titleColor}`}>
            {toast.title}
          </p>
          {toast.description && (
            <p className="mt-1 text-xs leading-relaxed text-reveillon-silver">
              {toast.description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fechar notificação"
          className="shrink-0 rounded-lg p-1 text-reveillon-silver-muted transition-colors hover:bg-reveillon-surface hover:text-reveillon-silver-light"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

