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
    <section className="session" aria-label="示範工作階段">
      <div className="notice notice--warn" role="status">
        這只是介面原型的工作階段畫面：沒有螢幕擷取、沒有輸入事件、沒有網路連線。
      </div>

      <div className="session__bar">
        <strong>{target.name}</strong>
        <span className="recent-item__id">{formatId(target.id)}</span>
        <span className="badge badge--accent">示範連線中</span>
        <button
          className="btn btn--ghost btn--small"
          type="button"
          aria-pressed={viewOnly}
          onClick={() => setViewOnly((v) => !v)}
        >
          {viewOnly ? <IconEyeOff size={16} /> : <IconEye size={16} />}
          {viewOnly ? '僅檢視（示範）' : '解除僅檢視（示範）'}
        </button>
        <button className="btn btn--danger" onClick={onDisconnect}>
          <IconPower size={18} /> 結束工作階段
        </button>
      </div>

      <p aria-live="polite" className="session__perm-note">
        {viewOnly
          ? '目前為「僅檢視」：開關只影響此示範畫面，並不會真的封鎖或解鎖任何輸入。'
          : '已切換為非僅檢視：仍然只是標示文字變化，本原型不會注入鍵盤、滑鼠或剪貼簿事件。'}
      </p>

      <div className="session__canvas">
        {/* Original placeholder artwork — a stylized empty desktop frame. */}
        <svg
          viewBox="0 0 960 540"
          className="session__screen"
          role="img"
          aria-label="示範桌面佔位畫面：僅為示意，並非實際遠端螢幕內容"
        >
          <rect width="960" height="540" fill="#1e2a2e" />
          <rect x="0" y="0" width="960" height="42" fill="#243137" />
          <circle cx="28" cy="21" r="7" fill="#7fb89f" />
          <text x="52" y="27" fill="#a8d5ba" fontSize={16}>
            OpenDesk 示範工作階段（非實際畫面）
          </text>
          <rect x="30" y="140" width="420" height="240" rx="12" fill="none" stroke="#a8d5ba" strokeWidth={2.5} />
          <path d="M60 200h360M60 240h280M60 280h320M60 320h240" stroke="#3e5b52" strokeWidth={10} strokeLinecap="round" />
          <text x="480" y="470" fill="#7fb89f" fontSize={15}>
            {target.name} · {formatId(target.id)} — 佔位畫面，無任何資料傳輸
          </text>
        </svg>
      </div>

      <div className="session__unavailable" aria-label="不可用的真實功能">
        <button className="btn btn--ghost btn--small" type="button" disabled>
          傳送鍵盤事件
        </button>
        <button className="btn btn--ghost btn--small" type="button" disabled>
          同步剪貼簿
        </button>
        <button className="btn btn--ghost btn--small" type="button" disabled>
          請求螢幕畫面
        </button>
      </div>
      <p className="session__unavailable-note">
        上述按鈕在本原型中永遠不可用：本專案沒有實作任何輸入注入、剪貼簿同步或螢幕擷取功能，
        因此不開放點擊，也不會在未來「隱藏地」執行這些動作。
      </p>

      <div className="session__info">
        <span>本機 ID：{formatId(localId)}</span>
        <span>工作階段類型：純前端模擬</span>
        <span>實際解析、編碼或頻寬數據：不適用（未連線）</span>
      </div>
    </section>
  );
}
