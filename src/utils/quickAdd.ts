/**
 * Central "+" button routing. Each screen registers what its plus button
 * should do (open its own add sheet); the tab bar's center + triggers the
 * handler for the active route, falling back to the dashboard's expense
 * sheet when the active screen has nothing to add.
 */

type Handler = () => void;

const handlers: Record<string, Handler> = {};

export function registerQuickAdd(route: string, fn: Handler): () => void {
  handlers[route] = fn;
  return () => {
    if (handlers[route] === fn) delete handlers[route];
  };
}

export function triggerQuickAdd(route: string): boolean {
  const h = handlers[route] ?? handlers.dashboard;
  if (h) {
    h();
    return true;
  }
  return false;
}
