import type { CsvParseResult, CsvParseWarning, GameBet } from '@/types/lottery';

const MIN_NUMBERS_PER_GAME = 6;
const MAX_NUMBERS_PER_GAME = 20;
const MIN_LOTTERY_NUMBER = 1;
const MAX_LOTTERY_NUMBER = 60;
const MAX_CSV_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Sample Mega da Virada pool CSV (no headers, 6 to 10 numbers per game)
 * for immediate demonstration and portfolio testing.
 */
export const SAMPLE_POOL_CSV = [
  '01,17,19,29,50,57',
  '01,05,17,19,29,44,50',
  '03,12,17,19,29,50,52,57',
  '04,11,17,22,29,38,49,50,57,60',
  '02,08,14,25,36,48',
  '07,15,21,33,42,58',
  '01,10,17,19,35,50',
  '06,13,24,31,45,56,59',
  '09,18,27,34,46,53',
  '01,17,19,29,41,55',
  '12,20,28,39,47,54,58,60',
  '05,16,23,30,40,51',
].join('\n');

/**
 * Formats a Mega-Sena number with two digits (e.g. 5 -> "05").
 */
export function formatDezena(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * Reads an uploaded CSV file safely as UTF-8 text and validates readability.
 */
export function readCsvFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Nenhum arquivo foi selecionado para leitura.'));
      return;
    }

    if (file.size === 0) {
      reject(new Error('O arquivo enviado está vazio e não pôde ser processado.'));
      return;
    }

    if (file.size > MAX_CSV_FILE_SIZE_BYTES) {
      reject(
        new Error(
          'O arquivo excede o limite máximo de 10 MB. Verifique se o arquivo CSV está correto.'
        )
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(
          new Error(
            'Não foi possível interpretar o conteúdo do arquivo como texto.'
          )
        );
        return;
      }

      // Guard against binary files disguised with a .csv extension
      if (reader.result.includes('\u0000')) {
        reject(
          new Error(
            'O arquivo parece ser binário ou estar corrompido. Envie um arquivo CSV válido em texto.'
          )
        );
        return;
      }

      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(
        new Error(
          'Erro ao ler o arquivo. Verifique as permissões ou se o arquivo não está corrompido.'
        )
      );
    };

    reader.onabort = () => {
      reject(new Error('A leitura do arquivo foi cancelada.'));
    };

    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Parses raw CSV text into validated Mega-Sena games.
 * - Expects NO header row.
 * - Filters out completely empty rows (including delimiter-only rows).
 * - Supports comma (,), semicolon (;), or tab (\t) delimiters.
 * - Validates 6 to 20 unique integers between 1 and 60 per game.
 */
export function parseGamesCsv(
  rawContent: string,
  fileName?: string
): CsvParseResult {
  // Strip UTF-8 BOM if exported from Excel
  const normalizedContent = rawContent.replace(/^\uFEFF/, '');
  const lines = normalizedContent.split(/\r\n|\n|\r/);

  const games: GameBet[] = [];
  const warnings: CsvParseWarning[] = [];
  let totalNonEmptyRows = 0;

  lines.forEach((line, index) => {
    const rowNumber = index + 1;
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      return;
    }

    // Split on comma, semicolon, or tab and strip optional surrounding quotes
    const tokens = trimmedLine
      .split(/[,;\t]+/)
      .map((cell) => cell.trim().replace(/^["']|["']$/g, '').trim())
      .filter((cell) => cell.length > 0);

    // Ignore rows that only contained delimiters and whitespace (e.g. ";;;;")
    if (tokens.length === 0) {
      return;
    }

    totalNonEmptyRows += 1;

    const parsedNumbers: number[] = [];
    let invalidToken: string | null = null;

    for (const token of tokens) {
      if (!/^\d+$/.test(token)) {
        invalidToken = token;
        break;
      }

      const num = Number.parseInt(token, 10);
      if (
        !Number.isInteger(num) ||
        num < MIN_LOTTERY_NUMBER ||
        num > MAX_LOTTERY_NUMBER
      ) {
        invalidToken = token;
        break;
      }

      parsedNumbers.push(num);
    }

    if (invalidToken !== null) {
      warnings.push({
        row: rowNumber,
        code: 'INVALID_NUMBER',
        message: `Linha ${rowNumber}: valor inválido encontrado ("${invalidToken}"). Utilize apenas números inteiros de 01 a 60, sem cabeçalho.`,
      });
      return;
    }

    const uniqueNumbers = Array.from(new Set(parsedNumbers));

    if (uniqueNumbers.length !== parsedNumbers.length) {
      warnings.push({
        row: rowNumber,
        code: 'DUPLICATE_NUMBERS',
        message: `Linha ${rowNumber}: contém dezenas repetidas no mesmo jogo. Cada dezena deve ser única.`,
      });
      return;
    }

    if (uniqueNumbers.length < MIN_NUMBERS_PER_GAME) {
      warnings.push({
        row: rowNumber,
        code: 'FEWER_THAN_SIX',
        message: `Linha ${rowNumber}: possui apenas ${uniqueNumbers.length} número(s). Cada jogo precisa ter no mínimo 6 dezenas.`,
      });
      return;
    }

    if (uniqueNumbers.length > MAX_NUMBERS_PER_GAME) {
      warnings.push({
        row: rowNumber,
        code: 'MORE_THAN_TWENTY',
        message: `Linha ${rowNumber}: possui ${uniqueNumbers.length} números. O máximo permitido na Mega-Sena é de 20 dezenas por jogo.`,
      });
      return;
    }

    const sortedNumbers = [...uniqueNumbers].sort((a, b) => a - b);

    games.push({
      id: games.length + 1,
      sourceRow: rowNumber,
      numbers: sortedNumbers,
    });
  });

  return {
    games,
    warnings,
    totalNonEmptyRows,
    fileName,
  };
}

