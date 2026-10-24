/**
 * Bound a service call's waiting time. This does not cancel the underlying work
 * unless the service honors the AbortSignal.
 */
export async function withTimeout(operation, timeoutMs, label = "operation") {
  const controller = new AbortController();
  let timer;

  try {
    return await Promise.race([
      operation(controller.signal),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new Error(`${label} timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      })
    ]);
  } finally {
    clearTimeout(timer);
  }
}
