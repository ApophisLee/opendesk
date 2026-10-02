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
      'Could not save the local ID: this browser environment cannot write to local storage, so the ID may be lost after a reload.',
    );
  }, [state.localId]);

  const handleRename = useCallback((name: string) => {
    const ok = saveDeviceName(name);
    if (ok) {
      setDeviceName(name.trim());
      setStorageWarn(null);
      return true;
    }
    setStorageWarn('Could not save the device name: local storage cannot be written, so the name was not persisted.');
    return false;
  }, []);

  const handleSettings = useCallback((s: AppSettings) => {
    const ok = saveSettings(s);
    if (ok) {
      setSettings(s);
      setStorageWarn(null);
      return true;
    }
    setStorageWarn('Could not save settings: local storage cannot be written, so the STUN list was not persisted.');
    return false;
  }, []);

  const handleRecentChange = useCallback((devices: RecentDevice[]) => {
    const ok = saveRecentDevices(devices);
    if (ok) {
      setRecent(devices);
      setStorageWarn(null);
      return true;
    }
    setStorageWarn('Could not save recent devices: local storage cannot be written, so the list was not persisted.');
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
