/**
 * SPDX-License-Identifier: AGPL-3.0-only
 * OpenDesk — Copyright (C) 2026 OpenDesk contributors (see LICENSE).
 */

/**
 * Original inline SVG icon set for OpenDesk. No icon packages or external
 * assets are used; every glyph below is hand-authored on a 24×24 grid with
 * currentColor strokes unless noted.
 */
import type { JSX } from 'react';
import type { PlatformKind } from '../types';

export interface IconProps {
  size?: number;
}

function svgProps(size?: number) {
  return {
    width: size ?? 24,
    height: size ?? 24,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor' as const,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
    focusable: false as const,
  };
}

/** Geometric brand mark: desk + monitor emitting a signal to two peers. */
export function BrandMark({ size = 40 }: IconProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="OpenDesk 標誌"
    >
      <rect width="64" height="64" rx="14" fill="currentColor" />
      <rect x="14" y="38" width="36" height="4" rx="2" stroke="#a8d5ba" strokeWidth="0" fill="#7fb89f" />
      <rect x="20" y="14" width="24" height="17" rx="3" fill="none" stroke="#a8d5ba" strokeWidth="2.5" />
      <path d="M32 26 L44 20 M32 26 L44 32" stroke="#7fb89f" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="46" cy="20" r="2.5" fill="#a8d5ba" />
      <circle cx="46" cy="32" r="2.5" fill="#a8d5ba" />
      <path d="M32 31 L32 38" stroke="#a8d5ba" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function IconDesktop({ size }: IconProps): JSX.Element {
  return (
    <svg {...svgProps(size)}>
      <rect x="3" y="5" width="18" height="12" rx="2" />
      <path d="M12 17v4M8 21h8" />
    </svg>
  );
}

export function IconHistory({ size }: IconProps): JSX.Element {
  return (
    <svg {...svgProps(size)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function IconSettings({ size }: IconProps): JSX.Element {
  return (
    <svg {...svgProps(size)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4v2.5M12 17.5V20M4.6 7.3l2.2 1.3M17.2 15.4l2.2 1.3M4.6 16.7l2.2-1.3M17.2 8.6l2.2-1.3" />
    </svg>
  );
}

export function IconCopy({ size }: IconProps): JSX.Element {
  return (
    <svg {...svgProps(size)}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h8" />
    </svg>
  );
}

export function IconCheck({ size }: IconProps): JSX.Element {
  return (
    <svg {...svgProps(size)}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function IconAlert({ size }: IconProps): JSX.Element {
  return (
    <svg {...svgProps(size)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v4.5M12 16.3v0.2" />
    </svg>
  );
}

export function IconPencil({ size }: IconProps): JSX.Element {
  return (
    <svg {...svgProps(size)}>
      <path d="M4 20l1-4L18 3a2.1 2.1 0 0 1 3 3L8 19l-4 1z" />
    </svg>
  );
}

export function IconPlus({ size }: IconProps): JSX.Element {
  return (
    <svg {...svgProps(size)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconTrash({ size }: IconProps): JSX.Element {
  return (
    <svg {...svgProps(size)}>
      <path d="M4 7h16M9 7V4h6v3M8 7l1 13h6l1-13" />
    </svg>
  );
}

export function IconEye({ size }: IconProps): JSX.Element {
  return (
    <svg {...svgProps(size)}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}

export function IconEyeOff({ size }: IconProps): JSX.Element {
  return (
    <svg {...svgProps(size)}>
      <path d="M3 3l18 18M9.5 9.7A2.6 2.6 0 0 0 14.4 12.6" />
      <path d="M6.3 6.6C3.9 8.6 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.6 0 3-.4 4.3-1.1" />
      <path d="M18.3 15.4c1.3-1.3 3.2-3.4 3.2-3.4S18 5.5 12 5.5c-.7 0-1.4.1-2 .2" />
    </svg>
  );
}

export function IconPower({ size }: IconProps): JSX.Element {
  return (
    <svg {...svgProps(size)}>
      <path d="M12 3v8" />
      <path d="M7 6.5a8 8 0 1 0 10 0" />
    </svg>
  );
}

export function IconArrowLeft({ size }: IconProps): JSX.Element {
  return (
    <svg {...svgProps(size)}>
      <path d="M20 12H5M11 5l-6 7 6 7" />
    </svg>
  );
}

export function IconConnect({ size }: IconProps): JSX.Element {
  return (
    <svg {...svgProps(size)}>
      <path d="M9.5 14.5a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1" />
      <path d="M14.5 9.5a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1" />
    </svg>
  );
}

export function IconSample({ size }: IconProps): JSX.Element {
  return (
    <svg {...svgProps(size)}>
      <path d="M12 3l7 4v8l-7 4-7-4V7l7-4z" />
      <path d="M12 8.5L8.6 10.5v3L12 15.5l3.4-2v-3L12 8.5z" />
    </svg>
  );
}

export function IconRestore({ size }: IconProps): JSX.Element {
  return (
    <svg {...svgProps(size)}>
      <path d="M4 9a8 8 0 1 1 2.6 5.9" />
      <path d="M4 4v5h5" />
    </svg>
  );
}

/** Platform glyphs for the recent-device list (original geometry). */
export function PlatformIcon({ kind, size = 20 }: { kind: PlatformKind } & IconProps): JSX.Element {
  switch (kind) {
    case 'linux':
      return (
        <svg {...svgProps(size)}>
          <circle cx="12" cy="9" r="4.5" />
          <path d="M8.5 13.5C6 14 5 16 5 19h14c0-3-1-5-3.5-5.5" />
        </svg>
      );
    case 'macos':
      return (
        <svg {...svgProps(size)}>
          <rect x="4" y="4" width="16" height="12" rx="2" />
          <path d="M9 20h6M12 16v4" />
        </svg>
      );
    case 'windows':
      return (
        <svg {...svgProps(size)}>
          <path d="M5 6.5L11 5v6H5zM13 4.7L19 3.5v8h-6z" />
          <path d="M5 12.5h6V20l-6-1.5zM13 12.5h6v7.9l-6 1.2z" />
        </svg>
      );
    case 'raspberry':
      return (
        <svg {...svgProps(size)}>
          <rect x="4" y="6" width="16" height="12" rx="2" />
          <path d="M8 9h3v3H8zM14 9h3v3h-3z" />
        </svg>
      );
  }
}
