import { describe, expect, it } from 'vitest';
import { formatDezena, parseGamesCsv } from '@/utils/csvParser';

describe('formatDezena', () => {
  it('pads single-digit numbers with a leading zero', () => {
    expect(formatDezena(1)).toBe('01');
    expect(formatDezena(9)).toBe('09');
    expect(formatDezena(60)).toBe('60');
  });
});

describe('parseGamesCsv', () => {
  it('parses valid 6-to-20 number rows without headers and sorts numbers ascending', () => {
    const csv = [
      '57, 17, 01, 50, 29, 19',
      '60; 45; 30; 15; 05; 22; 11; 08',
    ].join('\n');

    const result = parseGamesCsv(csv, 'pool.csv');

    expect(result.warnings).toHaveLength(0);
    expect(result.totalNonEmptyRows).toBe(2);
    expect(result.games).toEqual([
      { id: 1, sourceRow: 1, numbers: [1, 17, 19, 29, 50, 57] },
      { id: 2, sourceRow: 2, numbers: [5, 8, 11, 15, 22, 30, 45, 60] },
    ]);
  });

  it('filters out completely empty rows and delimiter-only rows', () => {
    const csv = [
      '',
      '   ',
      ';;;;;',
      '\uFEFF01,02,03,04,05,06',
      '  ,  ,  ',
      '10,20,30,40,50,60,,,',
      '',
    ].join('\n');

    const result = parseGamesCsv(csv);

    expect(result.totalNonEmptyRows).toBe(2);
    expect(result.warnings).toHaveLength(0);
    expect(result.games).toHaveLength(2);
    expect(result.games[0].sourceRow).toBe(4);
    expect(result.games[1].sourceRow).toBe(6);
  });

  it('emits a warning when any row has fewer than 6 numbers', () => {
    const csv = [
      '01,02,03,04,05',
      '07,14,21,28,35,42',
    ].join('\n');

    const result = parseGamesCsv(csv);

    expect(result.games).toHaveLength(1);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toMatchObject({
      row: 1,
      code: 'FEWER_THAN_SIX',
    });
  });

  it('emits a warning when any row has more than 20 numbers', () => {
    const twentyOne = Array.from({ length: 21 }, (_, idx) => idx + 1).join(',');
    const result = parseGamesCsv(twentyOne);

    expect(result.games).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toMatchObject({
      row: 1,
      code: 'MORE_THAN_TWENTY',
    });
  });

  it('rejects rows with out-of-range, non-numeric, or duplicate numbers', () => {
    const csv = [
      '01,02,03,04,05,61',
      'Bola1,Bola2,Bola3,Bola4,Bola5,Bola6',
      '05,05,10,20,30,40',
    ].join('\n');

    const result = parseGamesCsv(csv);

    expect(result.games).toHaveLength(0);
    expect(result.warnings).toHaveLength(3);
    expect(result.warnings.map((w) => w.code)).toEqual([
      'INVALID_NUMBER',
      'INVALID_NUMBER',
      'DUPLICATE_NUMBERS',
    ]);
  });
});

