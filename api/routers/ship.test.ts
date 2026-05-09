import { describe, it, expect, vi } from 'vitest';
import { createCaller } from '../test/helpers';

vi.mock('../queries/connection', () => ({
  getDb: () => ({
    select: () => ({
      from: () => ({
        orderBy: () => ({
          limit: () => Promise.resolve([]),
        }),
      }),
    }),
    insert: () => ({
      values: () => Promise.resolve([{ insertId: 1 }]),
    }),
  }),
}));

describe('ship router', () => {
  const caller = createCaller();

  it('getCurrent returns fallback ship data when db is empty', async () => {
    const result = await caller.ship.getCurrent();
    expect(result.vesselName).toBe('MV Hondius');
    expect(result.operator).toBe('Oceanwide Expeditions');
    expect(result.status).toContain('Tenerife');
    expect(result.peopleOnboard).toBe(150);
    expect(result.inIcu).toBe(2);
    expect(result.evacuated).toBe(3);
  });

  it('getRoute returns full voyage itinerary', async () => {
    const route = await caller.ship.getRoute();
    expect(route.length).toBe(7);
    expect(route[0].name).toContain('Ushuaia');
    expect(route[route.length - 1].name).toContain('Tenerife');
  });

  it('update mutation returns success', async () => {
    const result = await caller.ship.update({
      vesselName: 'MV Hondius',
      status: 'Quarantine',
      peopleOnboard: 120,
    });
    expect(result.success).toBe(true);
    expect(result.vesselName).toBe('MV Hondius');
    expect(result.status).toBe('Quarantine');
  });
});
