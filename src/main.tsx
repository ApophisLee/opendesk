/**
 * SPDX-License-Identifier: AGPL-3.0-only
 * OpenDesk — Copyright (C) 2026 OpenDesk contributors (see LICENSE).
 */
import { StrictMode, useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import type { AppSettings, RecentDevice } from './types';
import { generateLocalId } from './utils/id';
import {
  DEFAULT_SETTINGS,
  loadDeviceName,
  loadLocalId,
  loadRecentDevices,
  loadSettings,
  sampleDevices,
  saveDeviceName,
  saveLocalId,
  saveRecentDevices,
  saveSettings,
} from './utils/storage';

function bootstrap(): {
  localId: string;
  deviceName: string | null;
  settings: AppSettings;
  recentDevices: RecentDevice[];
} {
  let localId = loadLocalId();
  if (localId === null) {
    localId = generateLocalId();
    saveLocalId(localId);
  }
  const deviceName = loadDeviceName();
  const settings = loadSettings() ?? DEFAULT_SETTINGS;
  // A stored empty array stays empty (history was cleared); missing or
  // malformed storage falls back to the built-in fictional sample devices.
  const recentDevices = loadRecentDevices() ?? sampleDevices();
  return { localId, deviceName, settings, recentDevices };
}

function Root() {
  const [state] = useState(bootstrap);
  const [deviceName, setDeviceName] = useState<string | null>(state.deviceName);
  const [settings, setSettings] = useState<AppSettings>(state.settings);
  const [recent, setRecent] = useState<RecentDevice[]>(state.recentDevices);
  // Storage warnings bubble up so the App frame can show them once.
  const [storageWarn, setStorageWarn] = useState<string | null>(null);

  // The generated local ID must be persisted; a failed write is reported so
  // the UI never claims persistence silently.
  useEffect(() => {
    if (saveLocalId(state.localId)) return;
    setStorageWarn(
      '本機 ID 儲存失敗：此瀏覽器環境無法寫入本機儲存空間，ID 可能在重新載入後遺失。',
    );
  }, [state.localId]);

  const handleRename = useCallback((name: string) => {
    const ok = saveDeviceName(name);
    if (ok) {
      setDeviceName(name.trim());
      setStorageWarn(null);
      return true;
    }
    setStorageWarn('裝置名稱儲存失敗：本機儲存空間無法寫入，名稱未持久化。');
    return false;
  }, []);

  const handleSettings = useCallback((s: AppSettings) => {
    const ok = saveSettings(s);
    if (ok) {
      setSettings(s);
      setStorageWarn(null);
      return true;
    }
    setStorageWarn('設定儲存失敗：本機儲存空間無法寫入，STUN 清單未持久化。');
    return false;
  }, []);

  const handleRecentChange = useCallback((devices: RecentDevice[]) => {
    const ok = saveRecentDevices(devices);
    if (ok) {
      setRecent(devices);
      setStorageWarn(null);
      return true;
    }
    setStorageWarn('最近裝置儲存失敗：本機儲存空間無法寫入，清單未持久化。');
    return false;
  }, []);

  return (
    <App
      localId={state.localId}
      deviceName={deviceName}
      onRenameDevice={handleRename}
      settings={settings}
      onSaveSettings={handleSettings}
      recentDevices={recent}
      onRecentChange={handleRecentChange}
      storageWarning={storageWarn}
    />
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
