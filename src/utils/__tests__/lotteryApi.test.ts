import { describe, expect, it } from 'vitest';
import { validateManualDrawInputs } from '@/utils/lotteryApi';

describe('validateManualDrawInputs', () => {
  it('accepts 6 unique valid numbers and sorts them ascending', () => {
    const result = validateManualDrawInputs(['57', '01', '29', '17', '50', '19']);

    expect(result).toEqual({
      isValid: true,
      numbers: [1, 17, 19, 29, 50, 57],
      errorMessage: null,
    });
  });

  it('rejects duplicate numbers', () => {
    const result = validateManualDrawInputs(['01', '01', '19', '29', '50', '57']);

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('repetidas');
  });

  it('rejects numbers outside 01-60 range', () => {
    const result = validateManualDrawInputs(['00', '17', '19', '29', '50', '57']);
    expect(result.isValid).toBe(false);

    const overMax = validateManualDrawInputs(['01', '17', '19', '29', '50', '61']);
    expect(overMax.isValid).toBe(false);
  });

  it('rejects incomplete inputs', () => {
    const result = validateManualDrawInputs(['01', '17', '', '29', '50', '57']);
    expect(result.isValid).toBe(false);
  });
});

