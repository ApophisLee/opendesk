/**
 * SPDX-License-Identifier: AGPL-3.0-only
 * OpenDesk — Copyright (C) 2026 OpenDesk contributors (see LICENSE).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppSettings, NavPage, RecentDevice } from './types';
import { formatId, isValidNineDigitId, normalizeId } from './utils/id';
import { useDemoSession } from './hooks/useDemoSession';
import { NavRail } from './components/NavRail';
import { LocalDevicePanel } from './components/LocalDevicePanel';
import { ConnectPanel } from './components/ConnectPanel';
import { SessionView } from './components/SessionView';
import { RecentDevicesView } from './components/RecentDevicesView';
import { SettingsView } from './components/SettingsView';

interface AppProps {
  localId: string;
  deviceName: string | null;
  onRenameDevice: (name: string) => boolean;
  settings: AppSettings;
  onSaveSettings: (s: AppSettings) => boolean;
  recentDevices: RecentDevice[];
  /** Persists history and reports whether the write actually succeeded. */
  onRecentChange: (devices: RecentDevice[]) => boolean;
  /** Storage failure reported by the storage layer (null when healthy). */
  storageWarning: string | null;
}

interface Target {
  id: string;
  name: string;
}

export function App({
  localId,
  deviceName,
  onRenameDevice,
  settings,
  onSaveSettings,
  recentDevices,
  onRecentChange,
  storageWarning,
}: AppProps) {
  const [page, setPage] = useState<NavPage>('connect');
  const [phase, setPhase] = useState<'idle' | 'connecting' | 'session'>('idle');
  const [remoteId, setRemoteId] = useState('');
  const [remoteName, setRemoteName] = useState<string | null>(null);
  const [idError, setIdError] = useState<string | null>(null);
  // Surfaced when a storage write fails so we never claim persistence silently.
  const [storageWarn, setStorageWarn] = useState<string | null>(null);
  const targetRef = useRef<Target | null>(null);

  const session = useDemoSession();

  /** Save history and report whether the write actually persisted. */
  const persistHistory = useCallback(
    (devices: RecentDevice[]) => {
      const ok = onRecentChange(devices);
      if (!ok) {
        setStorageWarn('Local storage write failed: the list exists only in memory and will be lost after a reload.');
      }
      return ok;
    },
    [onRecentChange],
  );

  /** Record a completed demo attempt into recent history (demo-only data). */
  const commitHistory = useCallback(
    (t: Target) => {
      const previous = recentDevices.find((d) => d.id === t.id);
      // Keep the entry's own platform/sample flags; a built-in sample must not
      // be rewritten into a "real" user device, and linux/false must not be forced.
      const entry: RecentDevice = {
        id: t.id,
        name: previous ? previous.name : t.name,
        platform: previous ? previous.platform : 'linux',
        lastUsed: new Date().toISOString(),
        sample: previous ? previous.sample : false,
      };
      const existing = recentDevices.filter((d) => d.id !== t.id);
      return persistHistory([entry, ...existing].slice(0, 12));
    },
    [persistHistory, recentDevices],
  );

  /**
   * One-shot demo attempt. start() resolves exactly once per design, so the
   * phase transition below happens at most once and cannot loop even if this
   * callback were recreated by a parent.
   */
  const runDemo = useCallback(
    async (t: Target) => {
      targetRef.current = t;
      setPage('connect');
      setPhase('connecting');
      const result = await session.start(2400); // simulated handshake delay
      if (result === 'session') {
        setPhase('session');
        if (!commitHistory(t)) {
          setStorageWarn('Could not save history: this demo entry was not written to local storage.');
        } else {
          setStorageWarn(null);
        }
      } else {
        setPhase('idle');
      }
    },
    [commitHistory, session],
  );

  /** Validate the typed ID, then start exactly one demo attempt. */
  const beginConnect = useCallback(
    (idRaw: string, name: string | null) => {
      const id = normalizeId(idRaw);
      if (id === null || !isValidNineDigitId(id)) {
        setIdError('Invalid ID: enter nine digits (spaces or hyphens allowed).');
        return;
      }
      if (id === localId) {
        setIdError('You cannot connect to your own local ID.');
        return;
      }
      setIdError(null);
      void runDemo({ id, name: name ?? formatId(id) });
    },
    [localId, runDemo],
  );

  // Unmount safety net: no pending demo timers survive this component.
  useEffect(() => {
    return () => {
      session.dispose();
    };
  }, [session]);

  function disconnect() {
    const result = session.cancel();
    if (result === 'idle') {
      setPhase('idle');
      setRemoteId('');
      setRemoteName(null);
    }
  }

  function goTo(next: NavPage) {
    if (phase !== 'idle') {
      session.dispose(); // view change cleans pending timers
    }
    setPhase('idle');
    setPage(next);
  }

  return (
    <div className="app">
      <NavRail page={page} onNavigate={goTo} />
      <main className="main">
        <header className="topbar">
          <h1 className="topbar__title">
            {page === 'connect' && 'Remote connection'}
            {page === 'recent' && 'Recent devices'}
            {page === 'settings' && 'Connection settings'}
          </h1>
          <span className="badge badge--demo">UI prototype · demo only</span>
        </header>

        <div className="content">
          {(storageWarn || storageWarning) && (
            <div className="notice notice--warn" role="alert">
              {storageWarn ?? storageWarning}
            </div>
          )}
          {page === 'connect' && phase === 'idle' && (
            <>
              <LocalDevicePanel
                localId={localId}
                deviceName={deviceName}
                onRename={onRenameDevice}
              />
              <ConnectPanel
                remoteId={remoteId}
                setRemoteId={setRemoteId}
                remoteName={remoteName}
                setRemoteName={setRemoteName}
                errorText={idError}
                onStart={() => beginConnect(remoteId, remoteName)}
                onFieldErrorChange={() => setIdError(null)}
              />
            </>
          )}

          {page === 'connect' && phase === 'connecting' && (
            <ConnectingPanel target={targetRef.current} onCancel={disconnect} />
          )}

          {page === 'connect' && phase === 'session' && targetRef.current && (
            <SessionView
              target={targetRef.current}
              localId={localId}
              onDisconnect={disconnect}
            />
          )}

          {page === 'recent' && (
            <RecentDevicesView
              devices={recentDevices}
              localId={localId}
              onConnect={(d) => {
                void runDemo({ id: d.id, name: d.name });
              }}
              onFill={(id) => {
                setPage('connect');
                setRemoteId(id);
                setIdError(null);
              }}
              onClear={() => {
                if (persistHistory([])) {
                  setStorageWarn(null);
                }
              }}
            />
          )}

          {page === 'settings' && (
            <SettingsView settings={settings} onSave={onSaveSettings} />
          )}
        </div>
      </main>
    </div>
  );
}

function ConnectingPanel({
  target,
  onCancel,
}: {
  target: Target | null;
  onCancel: () => void;
}) {
  return (
    <section className="card" aria-live="polite">
      <div className="connecting-box">
        <span className="spinner" role="presentation" />
        <p>
          <strong>Demo connecting (not a real network connection)</strong>: simulating a
          connection to {target ? `${target.name} (${formatId(target.id)})` : ''}…
        </p>
        <button className="btn btn--danger" onClick={onCancel}>
          Cancel demo connection
        </button>
      </div>
    </section>
  );
}
