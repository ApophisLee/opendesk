/**
 * SPDX-License-Identifier: AGPL-3.0-only
 * OpenDesk — Copyright (C) 2026 OpenDesk contributors (see LICENSE).
 */
import type { NavPage } from '../types';
import { BrandMark, IconDesktop, IconHistory, IconSettings } from './icons';

const LABELS: Record<NavPage, string> = {
  connect: 'Remote connection',
  recent: 'Recent devices',
  settings: 'Connection settings',
};

export function NavRail({
  page,
  onNavigate,
}: {
  page: NavPage;
  onNavigate: (p: NavPage) => void;
}) {
  return (
    <nav className="sidebar" aria-label="Main navigation">
      <div className="sidebar__brand">
        <BrandMark size={40} />
        <span>
          <span className="sidebar__brand-name">OpenDesk</span>
          <span className="sidebar__brand-tag">Free remote desktop · prototype</span>
        </span>
      </div>
      <ul className="nav" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {(Object.keys(LABELS) as NavPage[]).map((p) => (
          <li key={p}>
            <button
              className={`nav__item${page === p ? ' is-active' : ''}`}
              onClick={() => onNavigate(p)}
              aria-current={page === p ? 'page' : undefined}
            >
              {p === 'connect' && <IconDesktop />}
              {p === 'recent' && <IconHistory />}
              {p === 'settings' && <IconSettings />}
              <span className="nav__label">{LABELS[p]}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="sidebar__foot">
        <p style={{ margin: 0 }}>Original project code is licensed under AGPL-3.0-only.</p>
        <a
          className="license-link"
          href="https://www.gnu.org/licenses/agpl-3.0.txt"
          target="_blank"
          rel="noreferrer"
        >
          AGPL-3.0-only
        </a>
        <a
          className="license-link"
          href="https://github.com/ApophisLee/opendesk"
          target="_blank"
          rel="noreferrer"
        >
          Source code
        </a>
      </div>
    </nav>
  );
}
