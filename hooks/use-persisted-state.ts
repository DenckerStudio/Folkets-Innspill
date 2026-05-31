'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { readLocalStorage, writeLocalStorage } from '@/lib/preferences/local-storage';

type SetStateAction<T> = T | ((prev: T) => T);

const listeners = new Map<string, Set<() => void>>();

function emitPreferenceChange(key: string) {
  listeners.get(key)?.forEach((listener) => listener());
}

function subscribeToPreference(key: string, listener: () => void) {
  const set = listeners.get(key) ?? new Set();
  set.add(listener);
  listeners.set(key, set);
  return () => {
    set.delete(listener);
    if (set.size === 0) listeners.delete(key);
  };
}

function readPreferenceValue<T>(
  key: string,
  defaultValue: T,
  isValid?: (value: unknown) => value is T
): T {
  const stored = readLocalStorage<unknown>(key);
  if (stored !== null) {
    if (isValid) {
      if (isValid(stored)) return stored;
    } else {
      return stored as T;
    }
  }
  return defaultValue;
}

export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  isValid?: (value: unknown) => value is T
): [T, (value: SetStateAction<T>) => void] {
  const getSnapshot = useCallback(
    () => readPreferenceValue(key, defaultValue, isValid),
    [key, defaultValue, isValid]
  );

  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue]);

  const value = useSyncExternalStore(
    (listener) => subscribeToPreference(key, listener),
    getSnapshot,
    getServerSnapshot
  );

  const setValue = useCallback(
    (next: SetStateAction<T>) => {
      const current = readPreferenceValue(key, defaultValue, isValid);
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(current) : next;
      writeLocalStorage(key, resolved);
      emitPreferenceChange(key);
    },
    [key, defaultValue, isValid]
  );

  return [value, setValue];
}
