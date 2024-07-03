import {AsyncLocalStorage} from 'node:async_hooks';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class MDC<Store extends Record<string, unknown> = Record<string, any>> {
  constructor(private _storage: AsyncLocalStorage<Store>) {}

  get<K extends keyof Store>(key: K) {
    const store = this.storage.getStore();
    if (!store) {
      throw new Error('async-mdc: AsyncLocalStorage store is not available');
    }
    return store[key];
  }

  set<K extends keyof Store>(key: K, value: Store[K]) {
    const store = this.storage.getStore();
    if (!store) {
      throw new Error('async-mdc: AsyncLocalStorage store is not available');
    }
    store[key] = value;
  }

  getCopyOfStore(): Store {
    const store = this.storage.getStore();
    return {...store} as Store;
  }

  clear() {
    const store = this.storage.getStore();
    if (!store) return;
    Object.keys(store).forEach((key) => {
      delete store[key as keyof Store];
    });
  }

  get storage() {
    return this._storage;
  }

  run<R>(store: Store, callback: () => R): R {
    return this.storage.run(store, callback);
  }
}
