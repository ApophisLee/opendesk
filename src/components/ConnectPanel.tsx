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
        Connect to a remote device
      </h2>
      <p className="card__desc">
        Enter the other party's OpenDesk ID (nine digits). Spaces and hyphens are
        accepted, e.g. 123 456 789.
        <strong>This action only runs a front-end simulation</strong>; it never sends any
        network packets.
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <div className={`field${errorText ? ' has-error' : ''}`}>
          <label className="field__label" htmlFor="remote-id">
            Remote ID
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
            Nine digits, first digit not zero. Demo mode never connects for real.
          </span>
        </div>

        {showName && (
          <div className="field">
            <label className="field__label" htmlFor="remote-name">
              Device note (optional)
            </label>
            <input
              id="remote-name"
              name="remote-name"
              className="field__input"
              maxLength={40}
              placeholder="e.g. Study PC"
              value={remoteName ?? ''}
              onChange={(e) => {
                const v = e.target.value.trimStart();
                setRemoteName(v.length ? v : null);
              }}
            />
            <span className="field__hint">
              Only used as a display name for this demo; nothing is sent to any
              server.
            </span>
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
          {showName ? 'Hide note' : 'Add note'}
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
            <IconConnect size={18} /> Start demo connection
          </button>
          <button type="button" className="btn btn--ghost" onClick={handleReset}>
            Clear
          </button>
        </div>
      </form>
    </section>
  );
}
