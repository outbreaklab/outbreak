import { describe, it, expect, vi } from 'vitest';
import { createCaller } from '../test/helpers';

vi.mock('../queries/connection', () => ({
  getDb: () => ({
    select: () => ({
      from: () => {
        const rows: any[] = [];
        return {
          orderBy: () => ({
            limit: () => Promise.resolve(rows),
          }),
          then: (resolve: any) => resolve(rows),
        };
      },
    }),
    insert: () => ({
      values: () => Promise.resolve([{ insertId: 1 }]),
    }),
  }),
}));

describe('outbreak router', () => {
  const caller = createCaller();

  it('getStats returns zero values when db is empty', async () => {
    const stats = await caller.outbreak.getStats();
    expect(stats.casesTotal).toBe(0);
    expect(stats.casesConfirmed).toBe(0);
    expect(stats.deaths).toBe(0);
    expect(stats.cfr).toBe(0);
    expect(stats.activeOutbreaks).toBe(0);
  });

  it('syncWHO returns fallback data on API failure', async () => {
    const result = await caller.outbreak.syncWHO();
    expect(result.source).toBe('WHO');
    expect(result).toHaveProperty('success');
  });

  it('syncECDC returns response from ECDC API', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(() => Promise.resolve(new Response(JSON.stringify({ records: [] }), { status: 200 }))) as any;
    const result = await caller.outbreak.syncECDC();
    expect(result.source).toBe('ECDC');
    expect(result).toHaveProperty('success');
    globalThis.fetch = originalFetch;
  });

  it('create mutation returns inserted id', async () => {
    const result = await caller.outbreak.create({
      source: 'Test',
      disease: 'Test Disease',
      casesConfirmed: 5,
      deaths: 1,
    });
    expect(result.id).toBe(1);
    expect(result.disease).toBe('Test Disease');
  });
});
