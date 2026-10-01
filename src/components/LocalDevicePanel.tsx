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
      setNameError('名稱不能為空白。');
      return;
    }
    const ok = onRename(trimmed);
    if (!ok) {
      setNameError('儲存失敗：此環境無法寫入本機儲存空間。');
      return;
    }
    setNameError(null);
    setEditing(false);
  }

  return (
    <section className="card" aria-labelledby="local-device-title">
      <h2 id="local-device-title" className="card__title">
        本機裝置
      </h2>
      <p className="card__desc">
        您的 OpenDesk ID（九位數字，自動產生並保存在本機瀏覽器）。本原型不會真的交換此 ID，也不會建立任何實際連線；真正的配對/信制機制尚未實作。
      </p>
      <div className="localid-row">
        <p className="localid-value">{formatId(localId)}</p>
        <button
          className="btn btn--ghost btn--small"
          onClick={handleCopy}
          aria-label={`複製本機 ID ${formatId(localId)}`}
        >
          {copyState === 'ok' ? <IconCheck size={16} /> : <IconCopy size={16} />}
          {copyState === 'ok'
            ? '已複製到剪貼簿'
            : copyState === 'fail'
              ? '複製失敗（瀏覽器拒絕存取）'
              : '複製 ID'}
        </button>
      </div>
      <p aria-live="polite" style={{ minHeight: '1.2em', margin: '6px 0 0' }}>
        {copyState === 'fail' && (
          <span className="error-text">剪貼簿複製失敗：瀏覽器或隱私設定拒絕了存取。</span>
        )}
      </p>

      <div className="name-row">
        <label htmlFor="device-name-input">裝置名稱</label>
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
              儲存名稱
            </button>
            <button
              className="btn btn--ghost btn--small"
              onClick={() => {
                setEditing(false);
                setDraft(deviceName ?? '');
                setNameError(null);
              }}
            >
              取消
            </button>
          </>
        ) : (
          <>
            <span style={{ fontWeight: 600 }}>
              {deviceName ?? '尚未命名（請點擊編輯）'}
            </span>
            <button
              className="btn btn--ghost btn--small"
              onClick={() => {
                setDraft(deviceName ?? '');
                setEditing(true);
              }}
            >
              <IconPencil size={16} /> 編輯名稱
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
