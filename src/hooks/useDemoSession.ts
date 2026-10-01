/**
 * SPDX-License-Identifier: AGPL-3.0-only
 * OpenDesk — Copyright (C) 2026 OpenDesk contributors (see LICENSE).
 */
import { useCallback, useEffect, useRef } from 'react';
import type { SessionPhase } from '../types';

interface Attempt {
  settled: boolean;
  resolve: (value: SessionPhase) => void;
}

/**
 * Demo session controller — the ONLY place that "advances" a session. It does
 * not open sockets, capture screens, or read input; it simply flips a phase
 * after a delay so the UI states can be exercised honestly. A real transport
 * adapter would replace this module later without touching components.
 *
 * Guarantees:
 * - every start() promise settles exactly once — canceled or superseded
 *   attempts resolve to 'idle' instead of staying pending forever;
 * - a generation counter prevents a canceled attempt from advancing a newer
 *   session;
 * - unmount clears all timers and settles any open promise.
 */
export function useDemoSession() {
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const activeRef = useRef(false);
  // The still-pending start() promise, shared with cancel/dispose/unmount.
  const attemptRef = useRef<Attempt | null>(null);
  const genRef = useRef(0);

  /** Settle the open attempt once; stale generations only ever see 'idle'. */
  const settle = useCallback((attempt: Attempt, value: SessionPhase) => {
    if (attempt.settled) return;
    attempt.settled = true;
    attempt.resolve(value);
  }, []);

  /** Tear down the current attempt: timer gone, promise settled as 'idle'. */
  const teardown = useCallback(() => {
    for (const t of timers.current) clearTimeout(t);
    timers.current.clear();
    activeRef.current = false;
    genRef.current++; // invalidate this attempt permanently
    const a = attemptRef.current;
    if (a) {
      settle(a, 'idle');
      if (attemptRef.current === a) attemptRef.current = null;
    }
  }, [settle]);

  /**
   * Begin a demo attempt. Resolves with the resulting phase after `delayMs`;
   * if it was canceled or superseded before then, resolves to 'idle'.
   */
  const start = useCallback(
    (delayMs: number): Promise<SessionPhase> => {
      if (activeRef.current) {
        // Duplicate attempts are rejected while one is active.
        return Promise.resolve('connecting');
      }
      const gen = ++genRef.current;
      activeRef.current = true;
      return new Promise<SessionPhase>((resolveRaw) => {
        const attempt: Attempt = { settled: false, resolve: resolveRaw };
        attemptRef.current = attempt;
        const finish = (value: SessionPhase) => settle(attempt, value);
        const t = setTimeout(() => {
          timers.current.delete(t);
          // A stale timer can never advance a newer session.
          if (activeRef.current && gen === genRef.current) {
            finish('session');
          } else {
            finish('idle');
          }
        }, delayMs);
        timers.current.add(t);
      });
    },
    [settle],
  );

  /** Cancel an in-flight attempt or end a session. Safe to call repeatedly. */
  const cancel = useCallback((): SessionPhase => {
    if (!activeRef.current && !attemptRef.current) return 'idle';
    teardown();
    return 'idle';
  }, [teardown]);

  /** Release everything (unmount / view change). */
  const dispose = useCallback(() => {
    teardown();
  }, [teardown]);

  // Unmount safety net: no dangling timers, no unresolved promises.
  useEffect(() => {
    return () => {
      teardown();
    };
  }, [teardown]);

  return { start, cancel, dispose };
}
