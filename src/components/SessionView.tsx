/**
 * SPDX-License-Identifier: AGPL-3.0-only
 * OpenDesk — Copyright (C) 2026 OpenDesk contributors (see LICENSE).
 */
import { useState } from 'react';
import { formatId } from '../utils/id';
import { IconEye, IconEyeOff, IconPower } from './icons';

export function SessionView({
  target,
  localId,
  onDisconnect,
}: {
  target: { id: string; name: string };
  localId: string;
  onDisconnect: () => void;
}) {
  // Demo-only permission switch. It changes nothing technical: no input
  // injection, no screen capture and no network exist in this prototype.
  const [viewOnly, setViewOnly] = useState(true);

  return (
    <section className="session" aria-label="Demo session">
      <div className="notice notice--warn" role="status">
        This is only a session screen from a UI prototype: no screen capture, no input
        events and no network connection.
      </div>

      <div className="session__bar">
        <strong>{target.name}</strong>
        <span className="recent-item__id">{formatId(target.id)}</span>
        <span className="badge badge--accent">Demo connected</span>
        <button
          className="btn btn--ghost btn--small"
          type="button"
          aria-pressed={viewOnly}
          onClick={() => setViewOnly((v) => !v)}
        >
          {viewOnly ? <IconEyeOff size={16} /> : <IconEye size={16} />}
          {viewOnly ? 'View only (demo)' : 'Exit view only (demo)'}
        </button>
        <button className="btn btn--danger" onClick={onDisconnect}>
          <IconPower size={18} /> End session
        </button>
      </div>

      <p aria-live="polite" className="session__perm-note">
        {viewOnly
          ? 'View only is on: this switch only changes the demo label; it does not actually block or unlock any input.'
          : 'View only is off: this is still only a label change; this prototype never injects keyboard, mouse or clipboard events.'}
      </p>

      <div className="session__canvas">
        {/* Original placeholder artwork — a stylized empty desktop frame. */}
        <svg
          viewBox="0 0 960 540"
          className="session__screen"
          role="img"
          aria-label="Placeholder demo desktop: an illustration only, not real remote screen content"
        >
          <rect width="960" height="540" fill="#1e2a2e" />
          <rect x="0" y="0" width="960" height="42" fill="#243137" />
          <circle cx="28" cy="21" r="7" fill="#7fb89f" />
          <text x="52" y="27" fill="#a8d5ba" fontSize={16}>
            OpenDesk demo session (not a real screen)
          </text>
          <rect x="30" y="140" width="420" height="240" rx="12" fill="none" stroke="#a8d5ba" strokeWidth={2.5} />
          <path d="M60 200h360M60 240h280M60 280h320M60 320h240" stroke="#3e5b52" strokeWidth={10} strokeLinecap="round" />
          <text x="480" y="470" fill="#7fb89f" fontSize={15}>
            {target.name} · {formatId(target.id)} — placeholder artwork, no data is transferred
          </text>
        </svg>
      </div>

      <div className="session__unavailable" aria-label="Real features that are unavailable">
        <button className="btn btn--ghost btn--small" type="button" disabled>
          Send keyboard events
        </button>
        <button className="btn btn--ghost btn--small" type="button" disabled>
          Sync clipboard
        </button>
        <button className="btn btn--ghost btn--small" type="button" disabled>
          Request screen frame
        </button>
      </div>
      <p className="session__unavailable-note">
        These buttons are permanently unavailable in this prototype: input injection,
        clipboard sync and screen capture are not implemented, so they cannot be
        clicked and will never run silently in the background.
      </p>

      <div className="session__info">
        <span>Local ID: {formatId(localId)}</span>
        <span>Session type: front-end simulation only</span>
        <span>Real resolution, encoding or bandwidth data: not applicable (no
          connection)
        </span>
      </div>
    </section>
  );
}
