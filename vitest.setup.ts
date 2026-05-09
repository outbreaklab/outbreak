import { vi } from 'vitest';

vi.mock('newsapi', () => ({
  default: vi.fn(() => ({
    v2: {
      everything: vi.fn(() => Promise.resolve({ articles: [] })),
    },
  })),
}));

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(() => ({
    messages: {
      create: vi.fn(() => Promise.reject(new Error('No API key'))),
    },
  })),
}));

vi.mock('node-telegram-bot-api', () => ({
  default: vi.fn(() => ({})),
}));
