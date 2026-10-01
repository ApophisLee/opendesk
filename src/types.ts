/**
 * SPDX-License-Identifier: AGPL-3.0-only
 * OpenDesk — Copyright (C) 2026 OpenDesk contributors (see LICENSE).
 */

export type NavPage = 'connect' | 'recent' | 'settings';

export type SessionPhase = 'idle' | 'connecting' | 'session';

/** A device entry shown in the "recent devices" list. All sample data is fictional. */
export interface RecentDevice {
  readonly id: string;          // nine digits, no separator
  readonly name: string;
  readonly platform: PlatformKind;
  /** ISO timestamp when the demo session was last used; undefined = never connected. */
  readonly lastUsed?: string;
  /** True for entries that ship with the app as examples (never stored user data). */
  readonly sample: boolean;
}

export type PlatformKind = 'linux' | 'macos' | 'windows' | 'raspberry';

/** Validated ICE server list entry (STUN URI only at this stage). */
export interface AppSettings {
  /** e.g. ["stun:stun.l.google.com:19302"] — used by a future transport layer, not now. */
  stunUris: string[];
}

export const DEFAULT_STUN_URIS: readonly string[] = [
  'stun:stun.l.google.com:19302',
];

/** Storage keys (versioned so malformed legacy data can be rejected cleanly). */
export const LS_KEYS = {
  localId: 'opendesk.localId.v1',
  deviceName: 'opendesk.deviceName.v1',
  settings: 'opendesk.settings.v1',
  recent: 'opendesk.recent.v1',
} as const;

/** Fictional sample devices shown when no history has been stored yet.
 *  These never represent real machines; IDs are random-looking placeholders. */
export const SAMPLE_DEVICES: readonly RecentDevice[] = [
  { id: '628401357', name: '示範裝置・書房桌機', platform: 'linux', sample: true },
  { id: '731905824', name: '示範裝置・客廳筆電', platform: 'macos', sample: true },
  { id: '856042913', name: '示範裝置・樹莓派工作機', platform: 'raspberry', sample: true },
];
