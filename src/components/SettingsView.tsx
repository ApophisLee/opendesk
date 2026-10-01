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
      if (trimmed.length === 0) return `第 ${i + 1} 筆為空白，請填入完整 URI 或移除該列。`;
      const reason = validateStunUri(trimmed);
      return reason ? `第 ${i + 1} 筆：${reason}` : null;
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
      setError('清單需至少一筆有效的 STUN URI（請使用「還原預設值」）。');
      setSaved(false);
      return;
    }
    if (new Set(values).size !== values.length) {
      setRowErrors([]);
      setError('STUN URI 清單中不得有重複項目。');
      setSaved(false);
      return;
    }
    if (values.length > MAX_ROWS) {
      setRowErrors([]);
      setError(`最多 ${MAX_ROWS} 筆 STUN URI。`);
      setSaved(false);
      return;
    }

    const ok = onSave({ stunUris: values });
    if (!ok) {
      setRowErrors([]);
      setError('儲存失敗：此環境無法寫入本機儲存空間（設定未持久化）。');
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
        STUN 伺服器清單
      </h2>
      <p className="card__desc">
        格式：stun:host 或 stun:host:port（亦可用 stuns:），「僅」允許此語法——不得含
        //、路徑或空白。最多 {MAX_ROWS} 筆且不可重複。STUN 是 ICE 用的伺服器清單，
        <strong>不是信制（signaling）伺服器</strong>；本原型完全不會建立任何網路連線，
        此清單只保留給未來的傳輸層使用。
      </p>

      {rows.map((r, i) => {
        const rowErr = rowErrors[i];
        const inputId = `stun-${i}`;
        const errId = `${inputId}-error`;
        const hintId = `${inputId}-hint`;
        return (
          <div className="stun-row" key={i}>
            <label className="field__label" htmlFor={inputId}>
              第 {i + 1} 筆
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
              範例：stun:stun.l.google.com:19302
            </span>
            <span id={errId} className="error-text" aria-hidden={!rowErr ? true : undefined}>
              {rowErr ?? ''}
            </span>
            <button
              className="btn btn--danger btn--small"
              onClick={() => removeRow(i)}
              disabled={rows.length <= 1}
              aria-label={`移除第 ${i + 1} 筆 STUN URI`}
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
          <IconPlus size={16} /> 新增一筆
        </button>
        <button className="btn btn--ghost" onClick={restoreDefault}>
          <IconRestore size={16} /> 還原 Google 預設值
        </button>
        <button className="btn btn--primary" onClick={save}>
          儲存設定
        </button>
      </div>

      <p aria-live="polite" style={{ minHeight: '1.2em', marginTop: 8 }}>
        {error && <span className="error-text">{error}</span>}
        {!error && saved && (
          <span className="notice notice--info">設定已儲存至本機瀏覽器。</span>
        )}
        {!error && restored && !saved && (
          <span className="notice notice--info">
            已載入 Google 預設值（尚未儲存，請按「儲存設定」）。
          </span>
        )}
      </p>
    </section>
  );
}
