/**
 * SPDX-License-Identifier: AGPL-3.0-only
 * OpenDesk — Copyright (C) 2026 OpenDesk contributors (see LICENSE).
 */
import type { AppSettings, PlatformKind, RecentDevice } from '../types';
import { DEFAULT_STUN_URIS, LS_KEYS, SAMPLE_DEVICES } from '../types';
import { normalizeId } from './id';

/**
 * Defensive localStorage layer. Every read validates the stored shape and
 * returns null on malformed data instead of silently trusting it; every write
 * fails soft (returns false) when storage is unavailable or full.
 */

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function removeRaw(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* storage unavailable — nothing to do */
  }
}

/** Persisted local device ID (nine digits, non-zero leading digit). */
export function loadLocalId(): string | null {
  const raw = readRaw(LS_KEYS.localId);
  if (raw == null) return null;
  const n = normalizeId(raw);
  if (n === null) return null;
  const id = n;
  if (!/^[1-9]\d{8}$/.test(id)) return null; // reject malformed legacy values
  return id;
}

export function saveLocalId(id: string): boolean {
  if (!/^[1-9]\d{8}$/.test(id)) return false;
  return writeRaw(LS_KEYS.localId, id);
}

/** Device name: trimmed, non-empty, bounded. */
const NAME_MAX = 40;
export function loadDeviceName(): string | null {
  const raw = readRaw(LS_KEYS.deviceName);
  if (raw == null) return null;
  const name = raw.trim();
  if (name.length === 0 || name.length > NAME_MAX) return null;
  return name;
}

export function saveDeviceName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length === 0 || trimmed.length > NAME_MAX) return false;
  return writeRaw(LS_KEYS.deviceName, trimmed);
}

/**
 * STUN URI grammar per RFC 7060/7061 as used in ICE server lists:
 * `stun:host[:port]` or `stuns:host[:port]` — scheme + colon only (no "//"),
 * host is a hostname, IPv4 address or bracketed IPv6 address, port 1..65535.
 */
const HOST_LABEL = /^(?:[a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])$/;
const IPV6_FULL = /^([0-9a-f]{1,4}:){7[0-9a-f]{1,4}$/i;

function isValidIpv6(inner: string): boolean {
  if (IPV6_FULL.test(inner)) return true;
  const parts = inner.split('::');
  if (parts.length !== 2) return false;
  const left = parts[0].length ? parts[0].split(':') : [];
  const right = parts[1].length ? parts[1].split(':') : [];
  if (left.length + right.length < 1 || left.length + right.length > 7) return false;
  return [...left, ...right].every((g) => /^[0-9a-f]{1,4}$/.test(g));
}

function isValidHost(host: string): boolean {
  if (host.length === 0 || host.length > 253) return false;
  if (host.startsWith('[')) {
    if (!host.endsWith(']')) return false;
    return isValidIpv6(host.slice(1, -1));
  }
  const v4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    return v4.slice(1).every((o) => Number(o) <= 255 && String(Number(o)) === o);
  }
  const labels = host.split('.');
  if (labels.length > 1) {
    return labels.every((l) => HOST_LABEL.test(l));
  }
  return HOST_LABEL.test(host);
}

/** Returns null when the value is a valid STUN URI, otherwise a reason. */
export function validateStunUri(value: string): string | null {
  const colonIdx = value.indexOf(':');
  if (colonIdx <= 0) return '前綴必須是 stun: 或 stuns:（不含斜線）。';
  const scheme = value.slice(0, colonIdx);
  if (scheme !== 'stun' && scheme !== 'stuns') return '前綴必須是 stun: 或 stuns:（不含斜線）。';
  let rest = value.slice(colonIdx + 1);
  if (rest.startsWith('//')) return '不得包含斜線（//）；格式為 stun:host 或 stun:host:port。';
  if (rest.length === 0) return '主機名稱不能為空白。';
  if (rest.includes('/')) return '不得包含路徑字元。';

  // Split host and port outside brackets so IPv6 hosts keep their colons.
  let host = rest;
  let portStr: string | null = null;
  const closeIdx = rest.lastIndexOf(']');
  // A trailing bracket means an IPv6 host; characters after it must be ":port".
  if (closeIdx !== -1 && rest.length > closeIdx + 1) {
    // characters after the closing bracket must be ":port"; anything else
    // (e.g. "stun:[::1]") is rejected by the host check below.
    const tail = rest.slice(closeIdx + 1);
    host = rest.slice(0, closeIdx + 1);
    const m = tail.match(/^:(\d{1,5})$/);
    if (!m) return 'IPv6 位址後的埠號格式無效（應為 :port）。';
    portStr = m[1];
    rest = rest.slice(0, closeIdx + 1); // host-only remainder for consistency
  } else {
    // A value that merely starts with '[' but never closes it (e.g. "[::1")
    // must not be parsed as host:port — reject it outright.
    if (rest.startsWith('[')) return 'IPv6 位址必須完整括號（缺少結尾的 ]）。';
    const portIdx = rest.lastIndexOf(':');
    if (portIdx !== -1) {
      host = rest.slice(0, portIdx);
      portStr = rest.slice(portIdx + 1);
    }
  }

  if (portStr !== null) {
    if (!/^\d{1,5}$/.test(portStr)) return '埠號必須是 1 到 65535 之間的數字。';
    const port = Number(portStr);
    if (port < 1 || port > 65535) return `埠號 ${port} 超出範圍（1..65535）。`;
  }
  // An unclosed bracket such as "stun:[::1" is invalid even though a colon
  // inside it was not treated as a port separator; without brackets an IPv6
  // value would contain unescaped colons and fail the host check anyway.
  if (!isValidHost(host)) return '主機名稱無效（請使用域名，或括號包住的 IPv6 位址）。';
  return null;
}

export function isStunUri(value: string): boolean {
  return validateStunUri(value) === null;
}

export const DEFAULT_SETTINGS: AppSettings = {
  stunUris: [...DEFAULT_STUN_URIS],
};

/** Settings: validate shape of persisted JSON so malformed data is rejected. */
export function loadSettings(): AppSettings | null {
  const raw = readRaw(LS_KEYS.settings);
  if (raw == null) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return null;
  }
  const obj = parsed as Record<string, unknown>;
  const maybeUris = obj['stunUris'];
  if (!Array.isArray(maybeUris)) return null;
  const uris: unknown[] = maybeUris as unknown[];
  if (uris.length === 0 || uris.length > 8) return null;
  for (const v of uris) {
    if (typeof v !== 'string' || !isStunUri(v)) return null;
  }
  const unique = new Set<string>(uris as string[]);
  if (unique.size !== uris.length) return null;
  return { stunUris: uris as string[] };
}

export function saveSettings(settings: AppSettings): boolean {
  try {
    return writeRaw(LS_KEYS.settings, JSON.stringify(settings));
  } catch {
    return false;
  }
}

/** Clipboard copy with honest failure reporting. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (!navigator.clipboard?.writeText) return false;
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Built-in fictional samples used when nothing valid has been stored. */
export function sampleDevices(): RecentDevice[] {
  return [...SAMPLE_DEVICES];
}

/**
 * Recent device history (only demo sessions end up here). Returns null only
 * when storage holds malformed data; an empty stored array stays empty after
 * a clear, while missing/invalid storage falls back to the sample devices.
 */
export function loadRecentDevices(): RecentDevice[] | null {
  const raw = readRaw(LS_KEYS.recent);
  if (raw == null) return sampleDevices();
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return sampleDevices();
  }
  if (!Array.isArray(parsed)) return sampleDevices();
  const out: RecentDevice[] = [];
  for (const item of parsed as unknown[]) {
    if (typeof item !== 'object' || item === null) return null;
    const d = item as Record<string, unknown>;
    const idOk = typeof d.id === 'string' && /^[0-9]{9}$/.test(d.id as string);
    const nameOk =
      typeof d.name === 'string' &&
      (d.name as string).trim().length > 0 &&
      (d.name as string).length <= NAME_MAX;
    const sampleOk = typeof d.sample === 'boolean';
    const platformOk =
      typeof d.platform === 'string' &&
      ['linux', 'macos', 'windows', 'raspberry'].includes(d.platform);
    if (!idOk || !nameOk || !sampleOk || !platformOk) return null;
    if (d.lastUsed != null) {
      if (typeof d.lastUsed !== 'string' || Number.isNaN(Date.parse(d.lastUsed))) {
        return null;
      }
    }
    out.push({
      id: d.id as string,
      name: (d.name as string).trim(),
      platform: d.platform as PlatformKind,
      lastUsed: d.lastUsed as string | undefined,
      sample: d.sample as boolean,
    });
  }
  if (out.length > 12) return null;
  const seen = new Set<string>();
  return out.filter((d) => {
    if (seen.has(d.id)) return false;
    seen.add(d.id);
    return true;
  });
}

export function saveRecentDevices(devices: RecentDevice[]): boolean {
  try {
    return writeRaw(LS_KEYS.recent, JSON.stringify(devices));
  } catch {
    return false;
  }
}

export function clearRecentDevices(): void {
  removeRaw(LS_KEYS.recent);
}
