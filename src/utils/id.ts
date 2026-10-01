/**
 * SPDX-License-Identifier: AGPL-3.0-only
 * OpenDesk — Copyright (C) 2026 OpenDesk contributors (see LICENSE).
 */

const DIGIT = /^\d$/;

/**
 * Normalize a user-typed ID string to its canonical nine-digit form by
 * stripping ASCII spaces, Unicode spaces (incl. ideographic U+3000), hyphen
 * variants (hyphen-minus, non-breaking hyphen U+2011, figure dash U+207B,
 * full-width hyphen U+FF0D) and converting full-width digits to ASCII.
 * Returns the canonical form or null if the input contains other characters.
 */
export function normalizeId(input: string): string | null {
  let out = '';
  for (const ch of input) {
    if (ch === ' ' || ch === '\u3000' || ch === '\t') continue; // ASCII/ideographic space + tab
    if (ch === '-' || ch === '\u2011' || ch === '\u207B' || ch === '\uFF0D') continue;
    const code = ch.charCodeAt(0);
    if (code >= 0xff10 && code <= 0xff19) {
      // full-width digit -> ASCII. NOTE: must be String.fromCharCode, not String(n):
      // String(n) yields the decimal text of n ("49"), not the character at U+n.
      out += String.fromCharCode(code - 0xff10 + 0x30);
      continue;
    }
    if (DIGIT.test(ch)) {
      out += ch;
      continue;
    }
    return null; // any other character makes the ID invalid
  }
  return out;
}

/** A valid OpenDesk ID: exactly nine digits, first digit not zero. */
export function isValidNineDigitId(input: string): boolean {
  const n = normalizeId(input);
  if (n === null) return false;
  return /^[1-9]\d{8}$/.test(n);
}

/** Format a canonical nine-digit ID as "XXX XXX XXX". */
export function formatId(id: string): string {
  if (!/^\d{9}$/.test(id)) return id;
  return `${id.slice(0, 3)} ${id.slice(3, 6)} ${id.slice(6)}`;
}

/** Generate a nine-digit local ID; first digit is never zero. */
export function generateLocalId(): string {
  const digits = new Array<string>(9);
  const buf = new Uint32Array(18); // extra entropy for rejection sampling
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(buf);
  } else {
    for (let i = 0; i < buf.length; i++) {
      buf[i] = Math.floor(Math.random() * 0xffffffff);
    }
  }
  let idx = 0;
  // First digit: 1-9 via rejection sampling to stay uniform.
  for (;;) {
    const v = buf[idx % buf.length] % 10;
    if (v >= 1) {
      digits[0] = String(v);
      break;
    }
    idx++;
  }
  for (let i = 1; i < 9; i++) {
    const v = buf[idx % buf.length] % 10;
    digits[i] = String(v);
    idx++;
  }
  const id = digits.join('');
  if (!isValidNineDigitId(id)) {
    // extremely unlikely; fall back to a Math.random loop
    let candidate = '';
    do {
      candidate = String(Math.floor(1e8 + Math.random() * 9e8));
    } while (!isValidNineDigitId(candidate));
    return candidate;
  }
  return id;
}
