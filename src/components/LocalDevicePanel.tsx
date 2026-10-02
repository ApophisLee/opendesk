/**
 * SPDX-License-Identifier: AGPL-3.0-only
 * OpenDesk — Copyright (C) 2026 OpenDesk contributors (see LICENSE).
 */
import { useEffect, useRef, useState } from 'react';
import { formatId } from '../utils/id';
import { copyText } from '../utils/storage';
import { IconCheck, IconCopy, IconPencil } from './icons';

export function LocalDevicePanel({
  localId,
  deviceName,
  onRename,
}: {
  localId: string;
  deviceName: string | null;
  onRename: (name: string) => boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(deviceName ?? '');
  const [copyState, setCopyState] = useState<'idle' | 'ok' | 'fail'>('idle');
  const [nameError, setNameError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  // Copy-feedback timer must not survive unmount.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  async function handleCopy() {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    const ok = await copyText(localId);
    setCopyState(ok ? 'ok' : 'fail');
    timerRef.current = window.setTimeout(() => setCopyState('idle'), 2500);
  }

  function saveName() {
    const trimmed = draft.trim();
    if (trimmed.length === 0) {
      setNameError('Name must not be blank.');
      return;
    }
    const ok = onRename(trimmed);
    if (!ok) {
      setNameError('Save failed: this environment cannot write to local storage.');
      return;
    }
    setNameError(null);
    setEditing(false);
  }

  return (
    <section className="card" aria-labelledby="local-device-title">
      <h2 id="local-device-title" className="card__title">
        Local device
      </h2>
      <p className="card__desc">
        Your OpenDesk ID (nine digits, generated automatically and kept in this
        browser only). This prototype never exchanges that ID with anyone and never
        creates a real connection; real pairing and signalling are not implemented.
      </p>
      <div className="localid-row">
        <p className="localid-value">{formatId(localId)}</p>
        <button
          className="btn btn--ghost btn--small"
          onClick={handleCopy}
          aria-label={`Copy local ID ${formatId(localId)}`}
        >
          {copyState === 'ok' ? <IconCheck size={16} /> : <IconCopy size={16} />}
          {copyState === 'ok'
            ? 'Copied to clipboard'
            : copyState === 'fail'
              ? 'Copy failed (blocked by browser)'
              : 'Copy ID'}
        </button>
      </div>
      <p aria-live="polite" style={{ minHeight: '1.2em', margin: '6px 0 0' }}>
        {copyState === 'fail' && (
          <span className="error-text">
            Clipboard copy failed: the browser or a privacy setting denied
            access.
          </span>
        )}
      </p>

      <div className="name-row">
        <label htmlFor="device-name-input">Device name</label>
        {editing ? (
          <>
            <input
              id="device-name-input"
              className="field__input"
              value={draft}
              maxLength={40}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveName();
                if (e.key === 'Escape') {
                  setEditing(false);
                  setDraft(deviceName ?? '');
                  setNameError(null);
                }
              }}
            />
            <button className="btn btn--primary btn--small" onClick={saveName}>
              Save name
            </button>
            <button
              className="btn btn--ghost btn--small"
              onClick={() => {
                setEditing(false);
                setDraft(deviceName ?? '');
                setNameError(null);
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <span style={{ fontWeight: 600 }}>
              {deviceName ?? 'Unnamed (click Edit name)'}
            </span>
            <button
              className="btn btn--ghost btn--small"
              onClick={() => {
                setDraft(deviceName ?? '');
                setEditing(true);
              }}
            >
              <IconPencil size={16} /> Edit name
            </button>
          </>
        )}
      </div>
      <p aria-live="polite" style={{ minHeight: '1.2em', margin: '8px 0 0' }}>
        {nameError && <span className="error-text">{nameError}</span>}
      </p>
    </section>
  );
}
