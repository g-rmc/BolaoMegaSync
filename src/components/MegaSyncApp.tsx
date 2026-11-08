'use client';

import { useCallback, useMemo, useState } from 'react';
import type {
  CsvParseResult,
  DrawInputMode,
  DrawResult,
} from '@/types/lottery';
import {
  evaluateGames,
  summarizeConference,
} from '@/utils/conferenceEngine';
import { ApiFetcher } from '@/components/ApiFetcher';
import { CsvUploader } from '@/components/CsvUploader';
import { GamesList } from '@/components/GamesList';
import { Header } from '@/components/Header';
import { SummaryDashboard } from '@/components/SummaryDashboard';
import { Toast, type ToastMessage } from '@/components/Toast';

const EMPTY_MANUAL_INPUTS = ['', '', '', '', '', ''];

/**
 * Top-level client SPA orchestrator connecting CSV parsing, draw fetching,
 * memoized conference engine evaluation, and the Reveillon dashboard UI.
 */
export function MegaSyncApp() {
  const [csvResult, setCsvResult] = useState<CsvParseResult | null>(null);
  const [fileReadError, setFileReadError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<DrawInputMode>('api');
  const [drawResult, setDrawResult] = useState<DrawResult | null>(null);
  const [manualInputs, setManualInputs] =
    useState<string[]>(EMPTY_MANUAL_INPUTS);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const games = useMemo(() => csvResult?.games ?? [], [csvResult]);
  const warnings = useMemo(() => csvResult?.warnings ?? [], [csvResult]);

  // Memoized conference engine avoids recalculation unless games or drawn numbers change
  const checkedGames = useMemo(
    () => evaluateGames(games, drawResult?.drawnNumbers ?? null),
    [games, drawResult]
  );

  const summary = useMemo(
    () => summarizeConference(checkedGames),
    [checkedGames]
  );

  const showToast = useCallback(
    (
      variant: ToastMessage['variant'],
      title: string,
      description?: string
    ) => {
      setToast({
        id: Date.now(),
        variant,
        title,
        description,
      });
    },
    []
  );

  const handleGamesLoaded = useCallback(
    (result: CsvParseResult) => {
      setCsvResult(result);

      if (result.games.length > 0) {
        setFileReadError(null);
        const total = result.games.length;
        const warningNote =
          result.warnings.length > 0
            ? `${result.warnings.length} linha(s) com inconsistência foram ignoradas.`
            : 'Todas as apostas estão prontas para conferência.';

        showToast(
          'success',
          `${total} ${
            total === 1
              ? 'jogo válido identificado e carregado!'
              : 'jogos válidos identificados e carregados!'
          }`,
          warningNote
        );
      }
    },
    [showToast]
  );

  const handleReadError = useCallback(
    (message: string) => {
      setFileReadError(message);
      showToast('error', 'Falha ao carregar CSV', message);
    },
    [showToast]
  );

  const handleClearGames = useCallback(() => {
    setCsvResult(null);
    setFileReadError(null);
    showToast('info', 'Lista de jogos limpa', 'Envie um novo arquivo CSV.');
  }, [showToast]);

  const handleDismissToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <div className="min-h-screen bg-reveillon-black bg-reveillon-radial text-reveillon-silver-light">
      <Header totalGames={games.length} drawResult={drawResult} />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Step 1 & Step 2 Controls */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CsvUploader
            onGamesLoaded={handleGamesLoaded}
            onReadError={handleReadError}
            onClearGames={handleClearGames}
            loadedFileName={csvResult?.fileName}
            loadedGamesCount={games.length}
            warnings={warnings}
            readError={fileReadError}
          />

          <ApiFetcher
            mode={inputMode}
            onModeChange={setInputMode}
            drawResult={drawResult}
            onDrawResultChange={setDrawResult}
            manualInputs={manualInputs}
            onManualInputsChange={setManualInputs}
          />
        </div>

        {/* Summary KPI Dashboard */}
        <SummaryDashboard
          summary={summary}
          hasGames={games.length > 0}
          hasDrawResult={drawResult !== null}
        />

        {/* Games List Grid */}
        <GamesList
          checkedGames={checkedGames}
          summary={summary}
          hasDrawResult={drawResult !== null}
        />
      </main>

      <footer className="mt-12 border-t border-reveillon-border/60 bg-reveillon-black/80 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-center text-xs text-reveillon-silver-muted sm:flex-row sm:px-6 lg:px-8">
          <p>
            BolãoMegaSync • Conferência local de apostas da Mega-Sena (sem envio
            dos seus jogos para servidores).
          </p>
          <p>
            Confira sempre os bilhetes físicos ou comprovantes oficiais da Caixa.
          </p>
        </div>
      </footer>

      <Toast toast={toast} onDismiss={handleDismissToast} />
    </div>
  );
}

