'use client';

import { useRef, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Edit3,
  Globe,
  Loader2,
  RotateCcw,
  Search,
  Sparkles,
} from 'lucide-react';
import type { DrawInputMode, DrawResult } from '@/types/lottery';
import { formatDezena } from '@/utils/csvParser';
import {
  fetchMegaSenaDraw,
  validateManualDrawInputs,
} from '@/utils/lotteryApi';

interface ApiFetcherProps {
  mode: DrawInputMode;
  onModeChange: (mode: DrawInputMode) => void;
  drawResult: DrawResult | null;
  onDrawResultChange: (result: DrawResult | null) => void;
  manualInputs: string[];
  onManualInputsChange: (values: string[]) => void;
}

function formatBrlCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

/**
 * Provides Caixa Official API draw fetching (via CORS proxy) with a
 * seamless Manual Entry fallback for 6 drawn numbers.
 */
export function ApiFetcher({
  mode,
  onModeChange,
  drawResult,
  onDrawResultChange,
  manualInputs,
  onManualInputsChange,
}: ApiFetcherProps) {
  const [contestInput, setContestInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);
  const manualRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleFetchFromApi = async (contestOverride?: string) => {
    const query =
      typeof contestOverride === 'string' ? contestOverride : contestInput;

    setApiError(null);
    setIsLoading(true);

    try {
      const result = await fetchMegaSenaDraw(query);
      onDrawResultChange(result);
      if (result.contestNumber) {
        setContestInput(String(result.contestNumber));
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao consultar o resultado da Mega-Sena.';
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const applyManualNumbers = (nextInputs: string[]) => {
    onManualInputsChange(nextInputs);

    const anyFilled = nextInputs.some((val) => val.trim().length > 0);
    if (!anyFilled) {
      setManualError(null);
      onDrawResultChange(null);
      return;
    }

    const allFilled = nextInputs.every((val) => val.trim().length > 0);
    const validation = validateManualDrawInputs(nextInputs);

    if (!validation.isValid) {
      onDrawResultChange(null);
      setManualError(allFilled ? validation.errorMessage : null);
      return;
    }

    setManualError(null);
    onDrawResultChange({
      contestNumber: null,
      drawDate: null,
      drawnNumbers: validation.numbers,
      source: 'manual',
    });
  };

  const handleManualSlotChange = (index: number, rawValue: string) => {
    const digitsOnly = rawValue.replace(/\D/g, '').slice(0, 2);
    const updated = [...manualInputs];
    updated[index] = digitsOnly;
    applyManualNumbers(updated);

    if (digitsOnly.length === 2 && index < 5) {
      manualRefs.current[index + 1]?.focus();
    }
  };

  const handleManualPaste = (
    event: React.ClipboardEvent<HTMLInputElement>,
    startIndex: number
  ) => {
    const pastedText = event.clipboardData.getData('text');
    const tokens = pastedText
      .split(/[\s,;.\-/]+/)
      .map((item) => item.trim())
      .filter((item) => /^\d{1,2}$/.test(item));

    if (tokens.length > 1) {
      event.preventDefault();
      const updated = [...manualInputs];
      tokens.slice(0, 6 - startIndex).forEach((token, offset) => {
        updated[startIndex + offset] = token;
      });
      applyManualNumbers(updated);

      const nextFocusIndex = Math.min(startIndex + tokens.length, 5);
      manualRefs.current[nextFocusIndex]?.focus();
    }
  };

  const handleSwitchToManual = () => {
    setApiError(null);
    onModeChange('manual');

    if (
      drawResult &&
      drawResult.drawnNumbers.length === 6 &&
      manualInputs.every((val) => val.trim() === '')
    ) {
      const prefilled = drawResult.drawnNumbers.map(formatDezena);
      onManualInputsChange(prefilled);
    }
  };

  const handleClearManual = () => {
    setManualError(null);
    onManualInputsChange(['', '', '', '', '', '']);
    onDrawResultChange(null);
    manualRefs.current[0]?.focus();
  };

  return (
    <section
      aria-labelledby="draw-fetcher-heading"
      className="flex flex-col rounded-2xl border border-reveillon-border bg-reveillon-charcoal/85 p-5 shadow-silver-card backdrop-blur-sm sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-reveillon-gold/15 text-xs font-bold text-reveillon-gold-bright">
              2
            </span>
            <h2
              id="draw-fetcher-heading"
              className="text-lg font-semibold text-white"
            >
              Resultado do Sorteio
            </h2>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-reveillon-silver">
            Busque um concurso oficial da Caixa ou alterne para inserção manual
            das 6 dezenas.
          </p>
        </div>

        {/* Mode Toggle */}
        <div
          role="tablist"
          aria-label="Modo de obtenção do resultado"
          className="inline-flex rounded-xl border border-reveillon-border bg-reveillon-obsidian p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'api'}
            onClick={() => {
              setManualError(null);
              onModeChange('api');
            }}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              mode === 'api'
                ? 'bg-reveillon-gold text-reveillon-black shadow-sm'
                : 'text-reveillon-silver hover:text-white'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            API Oficial
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === 'manual'}
            onClick={handleSwitchToManual}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              mode === 'manual'
                ? 'bg-reveillon-gold text-reveillon-black shadow-sm'
                : 'text-reveillon-silver hover:text-white'
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            Inserção Manual
          </button>
        </div>
      </div>

      {/* Mode 1: API Fetch */}
      {mode === 'api' && (
        <div className="mt-4 space-y-3">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleFetchFromApi();
            }}
            className="flex flex-col gap-2.5 sm:flex-row"
          >
            <div className="relative flex-1">
              <label htmlFor="contest-number-input" className="sr-only">
                Número do Concurso
              </label>
              <input
                id="contest-number-input"
                type="text"
                inputMode="numeric"
                value={contestInput}
                onChange={(event) => {
                  const cleanDigits = event.target.value.replace(/\D/g, '');
                  setContestInput(cleanDigits);
                }}
                placeholder="Concurso (ex: 2810) ou vazio p/ último"
                className="w-full rounded-xl border border-reveillon-border bg-reveillon-obsidian px-4 py-2.5 text-sm text-white placeholder-reveillon-silver-muted transition-colors focus:border-reveillon-gold focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gold-shimmer px-4 py-2.5 text-sm font-semibold text-reveillon-black shadow-gold-glow transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-initial"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Buscar Resultado
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => void handleFetchFromApi('')}
                title="Buscar o concurso mais recente da Mega-Sena"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-reveillon-border bg-reveillon-surface px-3.5 py-2.5 text-xs font-medium text-reveillon-silver-light transition-colors hover:border-reveillon-silver/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles className="h-3.5 w-3.5 text-reveillon-gold" />
                Último
              </button>
            </div>
          </form>

          <p className="text-[11px] text-reveillon-silver-muted">
            Consulta via proxy CORS compatível com hospedagem estática. Caso a
            API da Caixa apresente instabilidade, utilize a inserção manual.
          </p>

          {apiError && (
            <div
              role="alert"
              className="flex flex-col gap-3 rounded-xl border border-red-500/40 bg-red-950/35 p-3.5 text-xs text-red-200 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <p className="leading-relaxed">{apiError}</p>
              </div>
              <button
                type="button"
                onClick={handleSwitchToManual}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-reveillon-gold/50 bg-reveillon-gold/15 px-3 py-1.5 text-xs font-semibold text-reveillon-gold-light transition-colors hover:bg-reveillon-gold/25"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Inserção Manual
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Manual Entry */}
      {mode === 'manual' && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium text-reveillon-silver-light">
              Digite as 6 dezenas sorteadas (01 a 60):
            </span>
            <button
              type="button"
              onClick={handleClearManual}
              className="inline-flex items-center gap-1 text-xs text-reveillon-silver-muted transition-colors hover:text-reveillon-silver-light"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Limpar campos
            </button>
          </div>

          <div className="grid grid-cols-6 gap-2 sm:gap-3">
            {manualInputs.map((value, index) => (
              <div key={index} className="flex flex-col items-center">
                <label
                  htmlFor={`manual-dezena-${index}`}
                  className="mb-1 text-[10px] font-medium uppercase tracking-wider text-reveillon-silver-muted"
                >
                  {index + 1}ª
                </label>
                <input
                  id={`manual-dezena-${index}`}
                  ref={(el) => {
                    manualRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  value={value}
                  placeholder="00"
                  onChange={(event) =>
                    handleManualSlotChange(index, event.target.value)
                  }
                  onPaste={(event) => handleManualPaste(event, index)}
                  onKeyDown={(event) => {
                    if (
                      event.key === 'Backspace' &&
                      value.length === 0 &&
                      index > 0
                    ) {
                      manualRefs.current[index - 1]?.focus();
                    }
                  }}
                  className="h-12 w-full rounded-xl border border-reveillon-border bg-reveillon-obsidian text-center font-mono text-base font-bold text-reveillon-gold-light placeholder-reveillon-silver-dark transition-colors focus:border-reveillon-gold focus:outline-none focus:ring-1 focus:ring-reveillon-gold/50"
                />
              </div>
            ))}
          </div>

          <p className="text-[11px] text-reveillon-silver-muted">
            Dica: você pode colar os 6 números de uma só vez no primeiro campo.
          </p>

          {manualError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 text-xs text-amber-200"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <span>{manualError}</span>
            </div>
          )}
        </div>
      )}

      {/* Active Draw Result Banner */}
      {drawResult && (
        <div className="mt-5 rounded-xl border border-reveillon-gold/40 bg-gradient-to-br from-reveillon-obsidian via-reveillon-charcoal to-reveillon-obsidian p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-reveillon-gold-light">
              <span>
                {drawResult.source === 'api' && drawResult.contestNumber
                  ? `Resultado Oficial • Concurso #${drawResult.contestNumber}`
                  : 'Dezenas Definidas Manualmente'}
              </span>
            </div>

            {drawResult.drawDate && (
              <span className="inline-flex items-center gap-1 text-xs text-reveillon-silver">
                <Calendar className="h-3.5 w-3.5 text-reveillon-silver-muted" />
                {drawResult.drawDate}
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            {drawResult.drawnNumbers.map((num) => (
              <span
                key={num}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold-shimmer font-mono text-sm font-extrabold text-reveillon-black shadow-gold-ball ring-2 ring-reveillon-gold-light/50"
              >
                {formatDezena(num)}
              </span>
            ))}
          </div>

          {drawResult.prizeBreakdown && drawResult.prizeBreakdown.length > 0 && (
            <div className="mt-4 grid grid-cols-1 gap-2 border-t border-reveillon-border/70 pt-3 sm:grid-cols-3">
              {drawResult.prizeBreakdown.slice(0, 3).map((tier) => (
                <div
                  key={tier.tierLabel}
                  className="rounded-lg bg-reveillon-black/50 px-3 py-2 text-[11px]"
                >
                  <p className="font-semibold text-reveillon-silver-light">
                    {tier.tierLabel}
                  </p>
                  <p className="mt-0.5 text-reveillon-silver">
                    {tier.winners}{' '}
                    {tier.winners === 1 ? 'ganhador' : 'ganhadores'}
                  </p>
                  {tier.prizeAmount > 0 && (
                    <p className="font-mono font-medium text-reveillon-gold-light">
                      {formatBrlCurrency(tier.prizeAmount)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

