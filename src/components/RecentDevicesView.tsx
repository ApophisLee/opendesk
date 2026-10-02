/**
 * SPDX-License-Identifier: AGPL-3.0-only
 * OpenDesk — Copyright (C) 2026 OpenDesk contributors (see LICENSE).
 */
import { useEffect, useRef, useState } from 'react';
import type { RecentDevice } from '../types';
import { formatId } from '../utils/id';
import { copyText } from '../utils/storage';
import { IconCheck, IconCopy, IconSample, IconTrash, PlatformIcon } from './icons';

const PLATFORM_LABELS: Record<RecentDevice['platform'], string> = {
  linux: 'Linux',
  macos: 'macOS',
  windows: 'Windows',
  raspberry: 'Raspberry Pi',
};

function formatLastUsed(iso?: string): string {
  if (!iso) return 'Never connected';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Invalid timestamp';
  return `Last used ${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function RecentDevicesView({
  devices,
  localId,
  onConnect,
  onFill,
  onClear,
}: {
  devices: RecentDevice[];
  localId: string;
  onConnect: (d: RecentDevice) => void;
  onFill: (id: string) => void;
  onClear: () => void;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  // Feedback timers must be canceled when this view unmounts.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  async function handleCopy(id: string) {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    const ok = await copyText(id);
    if (!ok) {
      setCopiedId(null);
      setCopyError(
        'Copy failed: the browser or a privacy setting denied clipboard access, so nothing was written.',
      );
      timerRef.current = window.setTimeout(() => setCopyError(null), 4000);
      return;
    }
    setCopyError(null);
    setCopiedId(id);
    timerRef.current = window.setTimeout(() => setCopiedId(null), 2000);
  }

  const list = devices.filter((d) => d.id !== localId);

  return (
    <section className="card" aria-labelledby="recent-title">
      <h2 id="recent-title" className="card__title">
        Recent devices
      </h2>
      <p className="card__desc">
        These entries are only front-end simulation results stored in this
        browser: no device has ever actually been connected, and no screen or input
        data is included. The <strong>Built-in sample</strong> badge marks the
        fictional demo data shipped with this prototype. Clearing the list removes
        only these entries and leaves other stored items untouched.
      </p>

      {list.length === 0 ? (
        <div className="empty-state">
          No recently used devices yet.
        </div>
      ) : (
        <ul className="recent-list">
          {list.map((d) => (
            <li className="recent-item" key={d.id}>
              <span className="recent-item__icon">
                <PlatformIcon kind={d.platform} />
              </span>
              <div className="recent-item__body">
                <p className="recent-item__name">
                  {d.name}
                  {d.sample && (
                    <span className="badge badge--demo">
                      <IconSample size={12} /> Built-in sample
                    </span>
                  )}
                </p>
                <p className="recent-item__meta">
                  <span className="recent-item__id">{formatId(d.id)}</span> ·{' '}
                  {PLATFORM_LABELS[d.platform]} · {formatLastUsed(d.lastUsed)}
                </p>
              </div>
              <button
                className="btn btn--ghost btn--small"
                onClick={() => handleCopy(d.id)}
                aria-label={`Copy the ID of device ${d.name}`}
              >
                {copiedId === d.id ? <IconCheck size={14} /> : <IconCopy size={14} />}{' '}
                {copiedId === d.id ? 'Copied' : 'Copy'}
              </button>
              <button
                className="btn btn--ghost btn--small"
                onClick={() => onFill(d.id)}
              >
                Fill into connection form
              </button>
              <button
                className="btn btn--primary btn--small"
                onClick={() => onConnect(d)}
              >
                Demo connect
              </button>
            </li>
          ))}
        </ul>
      )}

      <p aria-live="polite" style={{ minHeight: '1.2em', margin: '8px 0 0' }}>
        {copyError && <span className="error-text">{copyError}</span>}
      </p>

      {list.length > 0 && (
        <div className="actions-row">
          <button className="btn btn--danger" onClick={onClear}>
            <IconTrash size={16} /> Clear recent history
          </button>
        </div>
      )}
    </section>
  );
}
