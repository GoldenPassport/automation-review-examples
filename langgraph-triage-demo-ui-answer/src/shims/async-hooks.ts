/**
 * Browser shim for Node's `async_hooks.AsyncLocalStorage`.
 *
 * LangGraph (and its tracing layer) reach for AsyncLocalStorage to thread
 * trace context through async boundaries. The browser has no equivalent,
 * but the demo doesn't use LangSmith tracing, so a no-op implementation is
 * functionally fine: `run()` just calls the callback with the store
 * temporarily set; `getStore()` returns whatever was last set.
 *
 * vite.config.ts aliases both `node:async_hooks` and `async_hooks` to this
 * file so any import resolves here.
 */
export class AsyncLocalStorage<T = unknown> {
  private store: T | undefined = undefined;

  getStore(): T | undefined {
    return this.store;
  }

  run<R>(store: T, callback: (...args: unknown[]) => R, ...args: unknown[]): R {
    const prev = this.store;
    this.store = store;
    try {
      return callback(...args);
    } finally {
      this.store = prev;
    }
  }

  enterWith(store: T): void {
    this.store = store;
  }

  disable(): void {
    this.store = undefined;
  }

  exit<R>(callback: (...args: unknown[]) => R, ...args: unknown[]): R {
    const prev = this.store;
    this.store = undefined;
    try {
      return callback(...args);
    } finally {
      this.store = prev;
    }
  }
}

// AsyncResource is also exported from async_hooks. LangGraph references it
// indirectly via some dependency chains; a no-op class is enough.
export class AsyncResource {
  constructor(_type?: string) {}
  runInAsyncScope<R>(fn: (...args: unknown[]) => R, _thisArg?: unknown, ...args: unknown[]): R {
    return fn(...args);
  }
  emitDestroy(): void {}
  asyncId(): number {
    return 0;
  }
  triggerAsyncId(): number {
    return 0;
  }
}

export default { AsyncLocalStorage, AsyncResource };
