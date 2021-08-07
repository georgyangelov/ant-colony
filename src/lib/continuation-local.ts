import { AsyncLocalStorage } from 'async_hooks';

export class ContinuationLocal<T> {
  private store = new AsyncLocalStorage<T>();

  set<R>(value: T, callback: () => R): R {
    // The return type of the `run` function is not correct in the TypeScript
    // definitions.
    //
    // See https://nodejs.org/docs/latest-v12.x/api/async_hooks.html#async_hooks_asynclocalstorage_run_store_callback_args
    //
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.store.run(value, callback) as any;
  }

  get(): T | undefined {
    return this.store.getStore();
  }
}
