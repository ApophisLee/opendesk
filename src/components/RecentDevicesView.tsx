/**
 * SPDX-License-Identifier: AGPL-3.0-only
 * OpenDesk — Copyright (C) 2026 OpenDesk contributors (see LICENSE).
 */
import { useEffect, useRef, useState } from 'react';
import type { RecentDevice } from '../types';
import { formatId } from '../utils/id';
import { copyText } from '../utils/storage';
import { IconCheck, IconCopy, IconSample, IconTrash, PlatformIcon } from './icons';

const PLATFORM_LABELS: Record<RecentDevice['platform'], string> = {
  linux: 'Linux',
  macos: 'macOS',
  windows: 'Windows',
  raspberry: 'Raspberry Pi',
};

function formatLastUsed(iso?: string): string {
  if (!iso) return '尚未連線過';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '時間資料無效';
  return `最近使用 ${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function RecentDevicesView({
  devices,
  localId,
  onConnect,
  onFill,
  onClear,
}: {
  devices: RecentDevice[];
  localId: string;
  onConnect: (d: RecentDevice) => void;
  onFill: (id: string) => void;
  onClear: () => void;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  // Feedback timers must be canceled when this view unmounts.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  async function handleCopy(id: string) {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    const ok = await copyText(id);
    if (!ok) {
      setCopiedId(null);
      setCopyError('複製失敗：瀏覽器或隱私設定拒絕了剪貼簿存取，ID 未寫入。');
      timerRef.current = window.setTimeout(() => setCopyError(null), 4000);
      return;
    }
    setCopyError(null);
    setCopiedId(id);
    timerRef.current = window.setTimeout(() => setCopiedId(null), 2000);
  }

  const list = devices.filter((d) => d.id !== localId);

  return (
    <section className="card" aria-labelledby="recent-title">
      <h2 id="recent-title" className="card__title">
        最近裝置
      </h2>
      <p className="card__desc">
        這裡的紀錄只是本機瀏覽器儲存的前端模擬結果：沒有實際連線過任何裝置，也不含螢幕或輸入資料。「內建範例」標記者為隨附的虛構示範資料。清除清單只會移除此清單，不會影響其他儲存項。
      </p>

      {list.length === 0 ? (
        <div className="empty-state">目前沒有最近使用過的裝置。</div>
      ) : (
        <ul className="recent-list">
          {list.map((d) => (
            <li className="recent-item" key={d.id}>
              <span className="recent-item__icon">
                <PlatformIcon kind={d.platform} />
              </span>
              <div className="recent-item__body">
                <p className="recent-item__name">
                  {d.name}
                  {d.sample && (
                    <span className="badge badge--demo">
                      <IconSample size={12} /> 內建範例
                    </span>
                  )}
                </p>
                <p className="recent-item__meta">
                  <span className="recent-item__id">{formatId(d.id)}</span> ·{' '}
                  {PLATFORM_LABELS[d.platform]} · {formatLastUsed(d.lastUsed)}
                </p>
              </div>
              <button
                className="btn btn--ghost btn--small"
                onClick={() => handleCopy(d.id)}
                aria-label={`複製裝置 ${d.name} 的 ID`}
              >
                {copiedId === d.id ? <IconCheck size={14} /> : <IconCopy size={14} />}{' '}
                {copiedId === d.id ? '已複製' : '複製'}
              </button>
              <button
                className="btn btn--ghost btn--small"
                onClick={() => onFill(d.id)}
              >
                填入連線
              </button>
              <button
                className="btn btn--primary btn--small"
                onClick={() => onConnect(d)}
              >
                示範連線
              </button>
            </li>
          ))}
        </ul>
      )}

      <p aria-live="polite" style={{ minHeight: '1.2em', margin: '8px 0 0' }}>
        {copyError && <span className="error-text">{copyError}</span>}
      </p>

      {list.length > 0 && (
        <div className="actions-row">
          <button className="btn btn--danger" onClick={onClear}>
            <IconTrash size={16} /> 清除最近紀錄
          </button>
        </div>
      )}
    </section>
  );
}
