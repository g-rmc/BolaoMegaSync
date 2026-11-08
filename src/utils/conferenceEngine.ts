import type {
  CheckedGame,
  ConferenceSummary,
  GameBet,
  PrizeTier,
} from '@/types/lottery';

/**
 * Determines the prize tier based on the exact hit count.
 */
function resolvePrizeTier(hitCount: number): PrizeTier {
  if (hitCount === 6) return 'sena';
  if (hitCount === 5) return 'quina';
  if (hitCount === 4) return 'quadra';
  return 'none';
}

/**
 * Evaluates all pool games against the 6 official drawn numbers.
 * Intended to be memoized with React's useMemo in the client orchestrator.
 */
export function evaluateGames(
  games: GameBet[],
  drawnNumbers: number[] | null
): CheckedGame[] {
  if (games.length === 0) {
    return [];
  }

  if (!drawnNumbers || drawnNumbers.length !== 6) {
    return games.map((game) => ({
      game,
      matchedNumbers: [],
      hitCount: 0,
      tier: 'none',
    }));
  }

  const drawnSet = new Set(drawnNumbers);

  return games.map((game) => {
    const matchedNumbers = game.numbers.filter((num) => drawnSet.has(num));
    const hitCount = matchedNumbers.length;

    return {
      game,
      matchedNumbers,
      hitCount,
      tier: resolvePrizeTier(hitCount),
    };
  });
}

/**
 * Computes summary counts (Total games, Quadras, Quinas, Senas)
 * from evaluated games.
 */
export function summarizeConference(
  checkedGames: CheckedGame[]
): ConferenceSummary {
  let quadras = 0;
  let quinas = 0;
  let senas = 0;

  for (const entry of checkedGames) {
    if (entry.hitCount === 4) {
      quadras += 1;
    } else if (entry.hitCount === 5) {
      quinas += 1;
    } else if (entry.hitCount === 6) {
      senas += 1;
    }
  }

  return {
    totalGames: checkedGames.length,
    quadras,
    quinas,
    senas,
    totalWinningGames: quadras + quinas + senas,
  };
}

