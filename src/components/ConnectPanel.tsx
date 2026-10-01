/**
 * SPDX-License-Identifier: AGPL-3.0-only
 * OpenDesk — Copyright (C) 2026 OpenDesk contributors (see LICENSE).
 */
import { useState } from 'react';
import { IconConnect, IconEye, IconEyeOff } from './icons';

export function ConnectPanel({
  remoteId,
  setRemoteId,
  remoteName,
  setRemoteName,
  errorText,
  onStart,
  onFieldErrorChange,
}: {
  remoteId: string;
  setRemoteId: (v: string) => void;
  remoteName: string | null;
  setRemoteName: (v: string | null) => void;
  errorText: string | null;
  onStart: () => void;
  onFieldErrorChange: () => void;
}) {
  // Controls whether the optional note field is rendered at all.
  const [showName, setShowName] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // Real form submission: Enter in either field submits; buttons inside use type.
    e.preventDefault();
    onStart();
  }

  function handleReset() {
    setRemoteId('');
    setRemoteName(null);
    setShowName(false);
    onFieldErrorChange();
  }

  const hintId = 'remote-id-hint';
  const errorId = 'remote-id-error';

  return (
    <section className="card" aria-labelledby="connect-title">
      <h2 id="connect-title" className="card__title">
        連線到遠端裝置
      </h2>
      <p className="card__desc">
        輸入對方的 OpenDesk ID（九位數字）。支援空格或連字號，例如 123 456 789。
        <strong>本動作只跑一段前端模擬</strong>，不會發送任何網路封包。
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <div className={`field${errorText ? ' has-error' : ''}`}>
          <label className="field__label" htmlFor="remote-id">
            遠端 ID
          </label>
          <input
            id="remote-id"
            name="remote-id"
            className="field__input tabular"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            placeholder="123 456 789"
            value={remoteId}
            aria-invalid={errorText ? true : undefined}
            aria-describedby={errorText ? `${hintId} ${errorId}` : hintId}
            onChange={(e) => {
              setRemoteId(e.target.value);
              onFieldErrorChange();
            }}
          />
          <span id={hintId} className="field__hint">
            九位數字，首位不為零。示範模式不會實際連線。
          </span>
        </div>

        {showName && (
          <div className="field">
            <label className="field__label" htmlFor="remote-name">
              裝置備註（選填）
            </label>
            <input
              id="remote-name"
              name="remote-name"
              className="field__input"
              maxLength={40}
              placeholder="例如：書房電腦"
              value={remoteName ?? ''}
              onChange={(e) => {
                const v = e.target.value.trimStart();
                setRemoteName(v.length ? v : null);
              }}
            />
            <span className="field__hint">僅作為示範顯示名稱，不會儲存到伺服器。</span>
          </div>
        )}

        <button
          type="button"
          className="btn btn--ghost btn--small"
          onClick={() => setShowName((s) => !s)}
          aria-expanded={showName}
          aria-controls={showName ? 'remote-name' : undefined}
        >
          {showName ? <IconEyeOff size={16} /> : <IconEye size={16} />}
          {showName ? '隱藏備註' : '新增備註'}
        </button>

        <div aria-live="polite">
          {errorText && (
            <p id={errorId} className="error-text">
              {errorText}
            </p>
          )}
        </div>

        <div className="actions-row">
          <button type="submit" className="btn btn--primary">
            <IconConnect size={18} /> 開始示範連線
          </button>
          <button type="button" className="btn btn--ghost" onClick={handleReset}>
            清空
          </button>
        </div>
      </form>
    </section>
  );
}
