import { appRouter } from '../router';

export function createCaller() {
  return appRouter.createCaller({
    req: new Request('http://localhost'),
    resHeaders: new Headers(),
  });
}
