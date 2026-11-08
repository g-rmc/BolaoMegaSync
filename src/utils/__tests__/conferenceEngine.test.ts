import { describe, expect, it } from 'vitest';
import type { GameBet } from '@/types/lottery';
import { evaluateGames, summarizeConference } from '@/utils/conferenceEngine';

describe('conferenceEngine', () => {
  const sampleGames: GameBet[] = [
    { id: 1, sourceRow: 1, numbers: [1, 17, 19, 29, 50, 57] }, // 6 hits (Sena)
    { id: 2, sourceRow: 2, numbers: [1, 17, 19, 29, 50, 58, 60] }, // 5 hits (Quina)
    { id: 3, sourceRow: 3, numbers: [1, 17, 19, 29, 35, 44, 55, 59] }, // 4 hits (Quadra)
    { id: 4, sourceRow: 4, numbers: [2, 8, 14, 25, 36, 48] }, // 0 hits
  ];

  const drawn = [1, 17, 19, 29, 50, 57];

  it('evaluates hits and prize tiers accurately across 6+ number bets', () => {
    const checked = evaluateGames(sampleGames, drawn);

    expect(checked[0]).toMatchObject({
      hitCount: 6,
      tier: 'sena',
      matchedNumbers: [1, 17, 19, 29, 50, 57],
    });
    expect(checked[1]).toMatchObject({
      hitCount: 5,
      tier: 'quina',
      matchedNumbers: [1, 17, 19, 29, 50],
    });
    expect(checked[2]).toMatchObject({
      hitCount: 4,
      tier: 'quadra',
      matchedNumbers: [1, 17, 19, 29],
    });
    expect(checked[3]).toMatchObject({
      hitCount: 0,
      tier: 'none',
      matchedNumbers: [],
    });
  });

  it('summarizes total games, quadras, quinas, and senas correctly', () => {
    const checked = evaluateGames(sampleGames, drawn);
    const summary = summarizeConference(checked);

    expect(summary).toEqual({
      totalGames: 4,
      quadras: 1,
      quinas: 1,
      senas: 1,
      totalWinningGames: 3,
    });
  });

  it('returns neutral unchecked results when drawn numbers are not set', () => {
    const checked = evaluateGames(sampleGames, null);
    const summary = summarizeConference(checked);

    expect(checked.every((item) => item.hitCount === 0 && item.tier === 'none')).toBe(
      true
    );
    expect(summary).toEqual({
      totalGames: 4,
      quadras: 0,
      quinas: 0,
      senas: 0,
      totalWinningGames: 0,
    });
  });
});

