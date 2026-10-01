# OpenDesk

OpenDesk 是一個**自由、開源的遠端桌面「介面」原型**（UI prototype）。
本倉庫目前只實作前端畫面與互動流程，**不含任何實際的網路連線、螢幕擷取或輸入事件**。

- 授權：**GNU AGPL-3.0-only**（單一版本，非「or later」）
- 原始碼：https://github.com/ApophisLee/opendesk （此倉庫由 supervisor 稍後建立；建立前請以本機副本為準）
- 版權聲明：Copyright (C) 2026 OpenDesk contributors（詳細見 `LICENSE`）

## 授權條款（AGPL-3.0-only）

本專案的原始元件均以 **GNU Affero General Public License version 3 only** 授權，
**僅限第 3 版**，不含「或之後的版本（or later）」選項。完整官方條文：

- 條款全文：<https://www.gnu.org/licenses/agpl-3.0.txt>
- GNU 自由軟體授權說明：<https://www.gnu.org/licenses/>

### 來源義務（source obligation）摘要

AGPL 相較其他 copyleft 條款，額外增加了「透過網路提供服務」的對價義務：

1. **散布程式碼或衍生作品**時，必須以本授權釋出，並提供完整原始碼與可取得方式。
2. **網路交互條款（Section 13 / SaaS 條款）**：若你修改本程式並「透過網路向使用者
   提供互動功能」（例如網頁服務、後端 API），即使你不散布 binaries，仍必須讓這些
   使用者能取得你所使用之完整原始碼（含你的修改）。
3. 任何衍生作品必須**繼續以 AGPL-3.0-only** 授權，不得附加額外限制或轉換為更寬鬆條款。
4. 必須保留版權聲明、授權標識與本條款本文（本專案各檔案頂部之
   `SPDX-License-Identifier: AGPL-3.0-only` 即為此用途）。

詳細義務與例外以 `LICENSE` 條文本文為準，上述僅為摘要，不構成獨立授權。

## 開發與建置需求

**最低支援版本**（由相依套件 `vite` 的 `engines.node` 決定，非本次安裝版本）：

- **Node.js**：`^20.19.0 || >=22.12.0`（即 Node 20.19.x 起，或 22.12 起；vite 7 的要求。
  TypeScript 5.9 另要求 `>=14.17`、rollup 4 要求 `>=18`，皆已被上述範圍涵蓋）
- **npm**：`>=8`（rollup `engines.npm`）

本次實際驗證使用 Node v26.3.0 / npm 11.16.0，僅供參考，非最低需求。

指令（於倉庫根目錄執行）：

```bash
npm install          # 安裝依賴
npm run dev          # Vite 開發伺服器，預設 http://localhost:5173
npm run build        # tsc -b && vite build（先型別檢查與 bundle，再產出 dist/）
npm run preview      # 本機預覽已建置的 dist/
```

> `npm run build` 的完整等價指令為 `tsc -b && vite build`；型別檢查失敗時不會產出
> `dist/`。 TypeScript 設定採 strict，並啟用 `noUnusedLocals` / `noUnusedParameters`。

## 範圍聲明：僅供 UI 示範

本原型**刻意不實作**任何實際功能，以避免誤導：

- **沒有** WebRTC / ICE / STUN / TURN 連線，也不發送任何網路封包。
- **沒有**螢幕擷取、輸入事件注入或剪貼簿同步（畫面中的相關按鈕永遠處於停用狀態）。
- 「連線」僅是一段前端計時模擬；ID、裝置名稱與最近紀錄只存在瀏覽器 `localStorage`。
- 介面中標註「內建範例」的裝置為**虛構示範資料**，不代表任何真實機器。

UI 以**繁體中文（zh-Hant）**呈現。

## WebRTC ICE 與後續路線圖（roadmap）

- **STUN 不等於信制（signaling）**：設定頁中的 `stun:stun.l.google.com:19302`
  只是 ICE 用的伺服器清單（Google 公共 STUN endpoint），僅用於取得候選位址，
  **不是**信制伺服器。本原型完全不會使用它建立連線。
- **未來需要獨立的信制伺服器（signaling server）**：兩端必須先交換 SDP / ICE candidate，
  這需要一套獨立、自架或可信任的信制通道（WebSocket 或長輪詢等），目前尚未設計。
- **TURN**：對稱式 NAT 或防火牆環境需以 TURN 中繼；此為後續工作，本原型未實作。
- **原生 Tauri 層**：真正的桌面控制（視窗、輸入、螢幕）需要 native layer（計畫以
  Tauri / Rust 實作），前端僅保留可替換的傳輸介面抽象，尚未開始。

## 第三方授權（third-party licenses）

本專案原始程式碼以 AGPL-3.0-only 授權；其**相依套件**各自維持原始授權（不因本專案
而改變）。依 `package-lock.json` 彙整如下：

| 相依套件 | 版本 | 授權 |
| --- | --- | --- |
| react, react-dom | 19.x | MIT |
| @vitejs/plugin-react, vite | 5.x / 7.x | MIT |
| @types/react, @types/react-dom | — | MIT |
| esbuild, rollup, postcss | — | MIT |
| typescript | 5.9.3 | Apache-2.0 |
| baseline-browser-mapping | 2.x | Apache-2.0 |
| caniuse-lite | 1.x | CC-BY-4.0 |
| source-map-js | 1.x | BSD-3-Clause |
| electron-to-chromium, lru-cache, picocolors, semver, yallist | — | ISC |

其餘相依套件依 npm 各自宣告之授權（多數為 MIT）；完整清單請參照 `package-lock.json`。

## 儲存空間與示範資料

- `localStorage` 鍵採版本化命名：`opendesk.localId.v1`、`opendesk.deviceName.v1`、
  `opendesk.settings.v1`、`opendesk.recent.v1`。
- 首次啟動或資料遺損時，最近裝置清單會回落至三筆**內建虛構範例裝置**（皆標記
  `sample: true`）；已明確「清除」而留下空陣列時則保持為空，不會被範例覆寫。

## 貢獻與授權相容性

修改或散布本專案原始元件時，必須遵守 AGPL-3.0-only 的全部義務（含網路交互條款）。
若你计划以本專案衍生產品提供線上服務，請務必先閱讀 `LICENSE` 與上述官方 GNU 連結。
