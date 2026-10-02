/**
 * SPDX-License-Identifier: AGPL-3.0-only
 * OpenDesk — Copyright (C) 2026 OpenDesk contributors (see LICENSE).
 */
import { useState } from 'react';
import type { AppSettings } from '../types';
import { DEFAULT_STUN_URIS } from '../types';
import { validateStunUri } from '../utils/storage';
import { IconPlus, IconRestore, IconTrash } from './icons';

interface DraftRow {
  value: string;
}

const MAX_ROWS = 8;

export function SettingsView({
  settings,
  onSave,
}: {
  settings: AppSettings;
  onSave: (s: AppSettings) => boolean;
}) {
  const [rows, setRows] = useState<DraftRow[]>(
    settings.stunUris.map((v) => ({ value: v })),
  );
  // Generic banner error (duplicate / empty list / write failure).
  const [error, setError] = useState<string | null>(null);
  // Per-row grammar messages, index-aligned with `rows`.
  const [rowErrors, setRowErrors] = useState<(string | null)[]>([]);
  const [saved, setSaved] = useState(false);
  const [restored, setRestored] = useState(false);

  function forgetMessages() {
    setError(null);
    setSaved(false);
    setRestored(false);
  }

  function updateRow(i: number, value: string) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { value } : r)));
    // Editing invalidates any previous saved/failed message and this row's error.
    setRowErrors((errs) => errs.map((e, idx) => (idx === i ? null : e)));
    forgetMessages();
  }

  function addRow() {
    if (rows.length >= MAX_ROWS) return;
    setRows((rs) => [...rs, { value: '' }]);
    // A new row makes stale save/error messages meaningless.
    forgetMessages();
    setRowErrors([]);
  }

  function removeRow(i: number) {
    setRows((rs) => rs.filter((_, idx) => idx !== i));
    // Drop the removed row's message so indexes stay aligned.
    setRowErrors((errs) => errs.filter((_, idx) => idx !== i));
    forgetMessages();
  }

  function restoreDefault() {
    setRows(DEFAULT_STUN_URIS.map((v) => ({ value: v })));
    setRowErrors([]);
    setError(null);
    setSaved(false);
    setRestored(true);
  }

  function save() {
    // Blank rows are validated (not silently dropped) so the user learns why.
    const perRow: (string | null)[] = rows.map((r, i) => {
      const trimmed = r.value.trim();
      if (trimmed.length === 0)
        return `Entry ${i + 1} is blank; fill in a full URI or remove this row.`;
      const reason = validateStunUri(trimmed);
      return reason ? `Entry ${i + 1}: ${reason}` : null;
    });
    setRowErrors(perRow);
    if (perRow.some((e) => e !== null)) {
      setError(null);
      setSaved(false);
      return;
    }

    const values = rows.map((r) => r.value.trim());
    if (values.length === 0) {
      setRowErrors([]);
      setError(
        'The list needs at least one valid STUN URI (use Restore Google default).',
      );
      setSaved(false);
      return;
    }
    if (new Set(values).size !== values.length) {
      setRowErrors([]);
      setError('The STUN URI list must not contain duplicates.');
      setSaved(false);
      return;
    }
    if (values.length > MAX_ROWS) {
      setRowErrors([]);
      setError(`At most ${MAX_ROWS} STUN URIs.`);
      setSaved(false);
      return;
    }

    const ok = onSave({ stunUris: values });
    if (!ok) {
      setRowErrors([]);
      setError(
        'Save failed: this environment cannot write to local storage, so the settings were not persisted.',
      );
      setSaved(false);
      return;
    }
    setRowErrors([]);
    setError(null);
    setRestored(false);
    setSaved(true);
  }

  return (
    <section className="card" aria-labelledby="settings-title">
      <h2 id="settings-title" className="card__title">
        STUN server list
      </h2>
      <p className="card__desc">
        Format: stun:host or stun:host:port (stuns: is also allowed). Only this
        grammar is accepted &mdash; no slashes, no path and no whitespace. Up to
{MAX_ROWS} entries, with no duplicates. STUN is a server list used by ICE;
        it is <strong>not a signalling server</strong>. This prototype never
        creates any network connection, so this list is reserved for a future
        transport layer.
      </p>

      {rows.map((r, i) => {
        const rowErr = rowErrors[i];
        const inputId = `stun-${i}`;
        const errId = `${inputId}-error`;
        const hintId = `${inputId}-hint`;
        return (
          <div className="stun-row" key={i}>
            <label className="field__label" htmlFor={inputId}>
              Entry {i + 1}
            </label>
            <input
              id={inputId}
              className={`field__input${rowErr ? ' has-error' : ''}`}
              value={r.value}
              aria-invalid={rowErr ? true : undefined}
              aria-describedby={
                rowErr ? `${hintId} ${errId}` : hintId
              }
              onChange={(e) => updateRow(i, e.target.value)}
              placeholder="stun:stun.example.org:3478"
            />
            <span id={hintId} className="field__hint">
              Example: stun:stun.l.google.com:19302
            </span>
            <span id={errId} className="error-text" aria-hidden={!rowErr ? true : undefined}>
              {rowErr ?? ''}
            </span>
            <button
              className="btn btn--danger btn--small"
              onClick={() => removeRow(i)}
              disabled={rows.length <= 1}
              aria-label={`Remove STUN URI entry ${i + 1}`}
            >
              <IconTrash size={14} />
            </button>
          </div>
        );
      })}

      <div className="actions-row">
        <button
          className="btn btn--ghost"
          onClick={addRow}
          disabled={rows.length >= MAX_ROWS}
        >
          <IconPlus size={16} /> Add an entry
        </button>
        <button className="btn btn--ghost" onClick={restoreDefault}>
          <IconRestore size={16} /> Restore Google default
        </button>
        <button className="btn btn--primary" onClick={save}>
          Save settings
        </button>
      </div>

      <p aria-live="polite" style={{ minHeight: '1.2em', marginTop: 8 }}>
        {error && <span className="error-text">{error}</span>}
        {!error && saved && (
          <span className="notice notice--info">
            Settings saved to this browser.
          </span>
        )}
        {!error && restored && !saved && (
          <span className="notice notice--info">
            Google default loaded (not saved yet; press Save settings with the button above).
          </span>
        )}
      </p>
    </section>
  );
}
