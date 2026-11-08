export type PrizeTier = 'sena' | 'quina' | 'quadra' | 'none';

export type DrawInputMode = 'api' | 'manual';

export interface GameBet {
  /** 1-based sequential identifier of the valid game */
  id: number;
  /** 1-based row number in the original CSV file */
  sourceRow: number;
  /** Chosen numbers sorted in ascending order (6 to 20 numbers, range 1-60) */
  numbers: number[];
}

export type CsvWarningCode =
  | 'FEWER_THAN_SIX'
  | 'MORE_THAN_TWENTY'
  | 'INVALID_NUMBER'
  | 'DUPLICATE_NUMBERS';

export interface CsvParseWarning {
  /** 1-based row number in the uploaded CSV file */
  row: number;
  code: CsvWarningCode;
  /** User-facing warning message in pt-BR */
  message: string;
}

export interface CsvParseResult {
  games: GameBet[];
  warnings: CsvParseWarning[];
  totalNonEmptyRows: number;
  fileName?: string;
}

export interface PrizeRateioItem {
  tierLabel: string;
  winners: number;
  prizeAmount: number;
}

export interface DrawResult {
  contestNumber: number | null;
  drawDate: string | null;
  /** 6 unique drawn numbers sorted in ascending order (range 1-60) */
  drawnNumbers: number[];
  source: DrawInputMode;
  accumulated?: boolean;
  nextPrizeEstimate?: number | null;
  prizeBreakdown?: PrizeRateioItem[];
}

export interface CheckedGame {
  game: GameBet;
  matchedNumbers: number[];
  hitCount: number;
  tier: PrizeTier;
}

export interface ConferenceSummary {
  totalGames: number;
  quadras: number;
  quinas: number;
  senas: number;
  totalWinningGames: number;
}

