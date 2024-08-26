import { ReplaySubject, share } from "rxjs";
import { MemoizeDecorator } from "./memoize-decorator.model";
import { MemoizePayload } from "./memoize-payload.model";

export function memoize({ extractUniqueId, clearCacheTimeout, debugReporter }: MemoizePayload): MemoizeDecorator {
  return (target: unknown, propertyKey: string, descriptor: PropertyDescriptor): void => {
    let cacheTeardownTimer: ReturnType<typeof setTimeout>;

    let cache = new Map<any, unknown>();

    const startTeardownTimeout = !clearCacheTimeout
      ? null
      : () => {
        if (cacheTeardownTimer) {
          debugReporter?.('Clearing the cache timeout timer');
          clearTimeout(cacheTeardownTimer);
        }
        debugReporter?.(`Cache to be cleared in ${clearCacheTimeout}ms`);
        cacheTeardownTimer = setTimeout(() => {
          debugReporter?.('Clearing the current cache of', cache);
          cache = new Map<any, unknown>();
          debugReporter?.('Cache cleared: ', cache);
        }, clearCacheTimeout);
      };

    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      startTeardownTimeout?.();

      const uniqueId: any = extractUniqueId(...args);
      debugReporter?.('Looking for a value with unique id of ', uniqueId);

      if (cache.has(uniqueId)) {
        const cachedResult = cache.get(uniqueId);
        debugReporter?.('Returning cached result', cachedResult);
        return cachedResult;
      }

      debugReporter?.('No cached result found');
      const result = originalMethod.apply(this, args).pipe(
        share({
          connector: () => new ReplaySubject(1),
          resetOnError: false,
          resetOnComplete: false,
          resetOnRefCountZero: false
        }));

      debugReporter?.('Storing a new entry in cache: ', { uniqueId, result });
      cache.set(uniqueId, result);
      debugReporter?.('Cache updated', cache);

      return result;
    }
  }
}
