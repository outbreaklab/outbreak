import { describe, it, expect } from 'vitest';
import { createCaller } from '../test/helpers';

describe('ai router', () => {
  const caller = createCaller();

  it('analyze returns fallback analysis without API key', async () => {
    const result = await caller.ai.analyze({
      disease: 'Hantavirus (ANDV)',
      cases: 8,
      deaths: 3,
      location: 'MV Hondius',
    });
    expect(result.success).toBe(false);
    expect(result.source).toBe('fallback');
    expect(result.analysis).toBeDefined();
    expect(result.analysis.riskLevel).toBe('moderate');
    expect(result.analysis.riskScore).toBe(45);
    expect(result.analysis.generalPublic).toContain('MV Hondius');
  });

  it('ask returns fallback answer without API key', async () => {
    const result = await caller.ai.ask({
      question: 'What are hantavirus symptoms?',
    });
    expect(result.success).toBe(false);
    expect(result.source).toBe('fallback');
    expect(result.answer).toContain('unable to process');
  });
});
