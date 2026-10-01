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
        setStorageWarn('本機儲存空間寫入失敗：清單僅存在於記憶體，重新載入後會遺失。');
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
          setStorageWarn('連線紀錄儲存失敗：此條示範紀錄未寫入本機儲存空間。');
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
        setIdError('ID 無效：請輸入九位數字（可含空格或連字號）。');
        return;
      }
      if (id === localId) {
        setIdError('不能連線到本機自己的 ID。');
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
            {page === 'connect' && '遠端連線'}
            {page === 'recent' && '最近裝置'}
            {page === 'settings' && '連線設定'}
          </h1>
          <span className="badge badge--demo">介面原型 · 僅供示範</span>
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
          <strong>示範連線中（非實際網路連線）</strong>：正在模擬連線到{' '}
          {target ? `${target.name}（${formatId(target.id)}）` : ''}…
        </p>
        <button className="btn btn--danger" onClick={onCancel}>
          取消示範連線
        </button>
      </div>
    </section>
  );
}
