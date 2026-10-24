const listeners = new Map();

/**
 * Subscribe a handler to an event type.
 * Returns an unsubscribe function so subscriptions can be managed explicitly.
 */
export function subscribe(eventType, handler) {
  if (!listeners.has(eventType)) listeners.set(eventType, new Set());
  listeners.get(eventType).add(handler);
  return () => listeners.get(eventType)?.delete(handler);
}

/**
 * Publish an event without knowing which services consume it.
 * Each handler is isolated: one failure does not prevent other handlers from running.
 */
export async function publish(event) {
  const handlers = [...(listeners.get(event.type) ?? [])];
  const results = await Promise.allSettled(
    handlers.map((handler) => handler(event))
  );

  return results.map((result, index) => ({
    eventType: event.type,
    handlerIndex: index,
    status: result.status,
    ...(result.status === "rejected" ? { error: result.reason } : {})
  }));
}
