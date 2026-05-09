import { describe, it, expect } from 'vitest';
import { createCaller } from '../test/helpers';

describe('telegram router', () => {
  const caller = createCaller();

  it('getStatus reports bot not configured', async () => {
    const status = await caller.telegram.getStatus();
    expect(status.configured).toBe(false);
    expect(status.botToken).toContain('Missing');
    expect(status.chatId).toContain('Missing');
  });

  it('autoAlert returns message without sending when bot not configured', async () => {
    const result = await caller.telegram.autoAlert({
      disease: 'Hantavirus (ANDV)',
      cases: 8,
      deaths: 3,
      location: 'MV Hondius',
    });
    expect(result.success).toBe(true);
    expect(result.sent).toBe(false);
    expect(result.severity).toBe('critical');
    expect(result.message).toContain('Hantavirus');
    expect(result.note).toContain('Bot not configured');
  });

  it('sendAlert returns error when bot not configured', async () => {
    const result = await caller.telegram.sendAlert({
      message: 'Test alert',
      severity: 'high',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('not configured');
    expect(result.wouldSend).toBeDefined();
  });
});
