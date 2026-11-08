'use client';

import { useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Sparkles,
  Trash2,
  UploadCloud,
  XCircle,
} from 'lucide-react';
import type { CsvParseResult, CsvParseWarning } from '@/types/lottery';
import {
  parseGamesCsv,
  readCsvFileAsText,
  SAMPLE_POOL_CSV,
} from '@/utils/csvParser';

interface CsvUploaderProps {
  onGamesLoaded: (result: CsvParseResult) => void;
  onReadError: (message: string) => void;
  onClearGames: () => void;
  loadedFileName?: string;
  loadedGamesCount: number;
  warnings: CsvParseWarning[];
  readError: string | null;
}

const MAX_VISIBLE_WARNINGS = 6;

/**
 * Handles CSV file drag-and-drop / selection, validation warnings,
 * and sample pool loading for quick verification.
 */
export function CsvUploader({
  onGamesLoaded,
  onReadError,
  onClearGames,
  loadedFileName,
  loadedGamesCount,
  warnings,
  readError,
}: CsvUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [showAllWarnings, setShowAllWarnings] = useState(false);

  const processCsvContent = (content: string, fileName: string) => {
    const parsed = parseGamesCsv(content, fileName);

    if (parsed.totalNonEmptyRows === 0) {
      onReadError(
        'O arquivo enviado não contém nenhuma linha com dados. Verifique o conteúdo do CSV.'
      );
      return;
    }

    if (parsed.games.length === 0) {
      onGamesLoaded(parsed);
      onReadError(
        'Nenhum jogo válido foi encontrado no arquivo. Confira os avisos de validação abaixo.'
      );
      return;
    }

    setShowAllWarnings(false);
    onGamesLoaded(parsed);
  };

  const handleFileSelection = async (file: File | undefined | null) => {
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const isLikelyCsv =
      lowerName.endsWith('.csv') ||
      lowerName.endsWith('.txt') ||
      file.type === 'text/csv' ||
      file.type === 'text/plain' ||
      file.type === 'application/vnd.ms-excel' ||
      file.type === '';

    if (!isLikelyCsv) {
      onReadError(
        `Formato não suportado (${file.name}). Envie um arquivo .csv contendo apenas os números dos jogos.`
      );
      return;
    }

    setIsReading(true);

    try {
      const content = await readCsvFileAsText(file);
      processCsvContent(content, file.name);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível ler o arquivo selecionado.';
      onReadError(message);
    } finally {
      setIsReading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLoadSamplePool = () => {
    setShowAllWarnings(false);
    const parsed = parseGamesCsv(SAMPLE_POOL_CSV, 'bolao-virada-exemplo.csv');
    onGamesLoaded(parsed);
  };

  const handleDownloadSampleCsv = () => {
    const blob = new Blob([SAMPLE_POOL_CSV], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'modelo-bolao-megasena.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const visibleWarnings = showAllWarnings
    ? warnings
    : warnings.slice(0, MAX_VISIBLE_WARNINGS);

  return (
    <section
      aria-labelledby="csv-uploader-heading"
      className="flex flex-col rounded-2xl border border-reveillon-border bg-reveillon-charcoal/85 p-5 shadow-silver-card backdrop-blur-sm sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-reveillon-gold/15 text-xs font-bold text-reveillon-gold-bright">
              1
            </span>
            <h2
              id="csv-uploader-heading"
              className="text-lg font-semibold text-white"
            >
              Apostas do Bolão (CSV)
            </h2>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-reveillon-silver">
            Envie um CSV <strong>sem cabeçalho</strong>: uma aposta por linha,
            de 6 a 20 dezenas (01 a 60), separadas por vírgula ou ponto e
            vírgula.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSamplePool}
            className="inline-flex items-center gap-1.5 rounded-lg border border-reveillon-gold/40 bg-reveillon-gold/10 px-3 py-1.5 text-xs font-medium text-reveillon-gold-light transition-colors hover:bg-reveillon-gold/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Testar Exemplo
          </button>

          <button
            type="button"
            onClick={handleDownloadSampleCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-reveillon-border bg-reveillon-surface px-3 py-1.5 text-xs font-medium text-reveillon-silver-light transition-colors hover:border-reveillon-silver/50 hover:text-white"
          >
            <Download className="h-3.5 w-3.5" />
            CSV Modelo
          </button>
        </div>
      </div>

      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Selecionar ou arrastar arquivo CSV com apostas do bolão"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          const droppedFile = event.dataTransfer.files?.[0];
          void handleFileSelection(droppedFile);
        }}
        className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-7 text-center transition-all ${
          isDragging
            ? 'border-reveillon-gold-bright bg-reveillon-gold/10 shadow-gold-glow'
            : 'border-reveillon-border bg-reveillon-obsidian/70 hover:border-reveillon-silver/50 hover:bg-reveillon-obsidian'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv,text/plain"
          className="hidden"
          onChange={(event) => {
            const selectedFile = event.target.files?.[0];
            void handleFileSelection(selectedFile);
          }}
        />

        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-reveillon-border bg-reveillon-surface text-reveillon-gold-bright">
          <UploadCloud className="h-5 w-5" />
        </div>

        <p className="mt-3 text-sm font-medium text-reveillon-silver-light">
          {isReading
            ? 'Lendo e validando arquivo CSV...'
            : 'Clique para selecionar ou arraste seu arquivo .csv aqui'}
        </p>
        <p className="mt-1 text-xs text-reveillon-silver-muted">
          Linhas vazias são filtradas automaticamente • Processamento 100%
          local no navegador
        </p>
      </div>

      {/* Loaded Summary Strip */}
      {loadedGamesCount > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-reveillon-gold/35 bg-reveillon-gold/5 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-reveillon-gold-bright" />
            <div className="text-xs">
              <span className="font-semibold text-reveillon-gold-light">
                {loadedGamesCount}{' '}
                {loadedGamesCount === 1
                  ? 'jogo válido carregado'
                  : 'jogos válidos carregados'}
              </span>
              {loadedFileName && (
                <span className="ml-1.5 inline-flex items-center gap-1 text-reveillon-silver">
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  {loadedFileName}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClearGames}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-reveillon-silver transition-colors hover:bg-reveillon-surface hover:text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Limpar
          </button>
        </div>
      )}

      {/* Critical File Read Error */}
      {readError && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-950/35 p-3.5 text-xs text-red-200"
        >
          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <div>
            <p className="font-semibold text-red-100">
              Não foi possível carregar o arquivo
            </p>
            <p className="mt-1 leading-relaxed text-red-200/90">{readError}</p>
          </div>
        </div>
      )}

      {/* Row Validation Warnings (e.g., rows with fewer than 6 numbers) */}
      {warnings.length > 0 && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-amber-500/40 bg-amber-950/25 p-3.5 text-xs text-amber-100"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-amber-200">
                Aviso de validação ({warnings.length}{' '}
                {warnings.length === 1
                  ? 'linha ignorada'
                  : 'linhas ignoradas'}
                )
              </p>
              <ul className="mt-2 space-y-1 text-amber-100/85">
                {visibleWarnings.map((warning) => (
                  <li key={`${warning.row}-${warning.code}`}>
                    • {warning.message}
                  </li>
                ))}
              </ul>

              {warnings.length > MAX_VISIBLE_WARNINGS && (
                <button
                  type="button"
                  onClick={() => setShowAllWarnings((prev) => !prev)}
                  className="mt-2 font-medium text-amber-300 underline underline-offset-2 hover:text-amber-200"
                >
                  {showAllWarnings
                    ? 'Mostrar menos avisos'
                    : `Ver todos os ${warnings.length} avisos`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

