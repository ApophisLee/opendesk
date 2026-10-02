# OpenDesk

OpenDesk is a **free, open-source remote-desktop *interface* prototype**. This
repository currently implements only the front-end screens and interaction flow.
It contains **no real network connection, no screen capture and no input
events**.

- License: **GNU AGPL-3.0-only** (version 3 only, not "or later")
- Source code: <https://github.com/ApophisLee/opendesk> (this repository is
  created later by the supervisor; until then use the local copy as the
  reference)
- Copyright notice: `Copyright (C) 2026 OpenDesk contributors` — see `LICENSE`
- UI language: English

## License (AGPL-3.0-only)

The original components of this project are licensed under the **GNU Affero
General Public License, version 3 only** — version 3 *only*, without the "or
later" option. The full official text is available at:

- Full license text: <https://www.gnu.org/licenses/agpl-3.0.txt>
- GNU free-software licensing information: <https://www.gnu.org/licenses/>

### Source obligation summary

Compared with other copyleft licences, AGPL adds a further obligation tied to
providing the software over a network:

1. **When you distribute the program or a derivative work**, you must do so
   under this licence and supply the complete corresponding source code plus a
   way to obtain it.
2. **Remote-network interaction (Section 13, the "SaaS clause")**: if you
   modify this program and let users interact with it over a computer network
   (for example a web service or backend API), those users must still receive
   the complete source code of the version you run, including your changes —
   even though you never distribute binaries.
3. Derivative works must **remain under AGPL-3.0-only**; no additional
   restrictions may be added and the work may not be converted to a more
   permissive licence.
4. Copyright notices, licence notices and this licence text must be preserved.
   Each file in this project carries `SPDX-License-Identifier: AGPL-3.0-only`
   for that purpose.

The authoritative wording, obligations and exceptions are those of the `LICENSE`
file; the summary above is not a separate grant.

## Development and build requirements

**Minimum supported versions** come from the `engines` fields of the installed
dependencies, not from the version used during verification:

- **Node.js**: `^20.19.0 || >=22.12.0` (i.e. Node 20.19.x or newer, or 22.12 or
  newer — the requirement declared by Vite 7.3.6). TypeScript 5.9.3 asks for
  `>=14.17` and Rollup 4.63.6 for `>=18.0.0`; both ranges are already covered
  by the Vite range above.
- **npm**: `>=8.0.0` (declared by Rollup).

Verification in this environment used Node v26.3.0 and npm 11.16.0; that is an
example of a working setup, not a minimum requirement.

Commands (run from the repository root):

```bash
npm install          # install dependencies
npm run dev          # Vite dev server, default http://localhost:5173
npm run build        # tsc -b && vite build (type-check + bundle, emits dist/)
npm run preview      # preview the built dist/ locally
```

> `npm run build` is exactly `tsc -b && vite build`; if the type check fails, no
> `dist/` output is produced. TypeScript runs in strict mode with
> `noUnusedLocals` and `noUnusedParameters` enabled.

## Scope statement: UI demonstration only

This prototype deliberately implements **no real functionality**, so that nobody
is misled:

- **No** WebRTC / ICE / STUN / TURN connection is ever established, and no
  network packets are sent.
- **No** screen capture, input-event injection or clipboard synchronisation
  exists; the related buttons on the session screen are permanently disabled.
- "Connecting" is only a front-end timer simulation. IDs, device names and the
  recent-devices list live solely in the browser's `localStorage`.
- Devices marked **Built-in sample** are **fictional demo data** and do not
  represent any real machine.

## WebRTC ICE notes and roadmap

- **STUN is not signalling.** The `stun:stun.l.google.com:19302` entry on the
  settings page is merely a server list used by ICE (a public Google STUN
  endpoint) for obtaining candidate addresses. It is **not** a signalling
  server, and this prototype never uses it to connect anything.
- **A dedicated signalling server will be needed later.** The two peers must
  first exchange SDP and ICE candidates over an independent, self-hosted or
  otherwise trusted signalling channel (WebSocket, long polling, …). That is not
  designed yet.
- **TURN**: symmetric NATs and restrictive firewalls require a TURN relay for
  real connectivity. This is future work and is not implemented here.
- **Native layer**: genuine desktop control (windows, input, screen) needs a
  native implementation (planned as Tauri / Rust). The front end only keeps a
  replaceable transport abstraction; this has not been started.

## Third-party licenses

The original source code of this project is licensed under AGPL-3.0-only. Its
**dependencies** keep their own original licences, which are not changed by this
project. Consolidated from `package-lock.json`:

| Dependency | Version | License |
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

Other dependencies follow the licence each npm package declares (mostly MIT);
see `package-lock.json` for the complete list.

## Storage keys and sample data

- `localStorage` keys are versioned: `opendesk.localId.v1`,
  `opendesk.deviceName.v1`, `opendesk.settings.v1`, `opendesk.recent.v1`.
- On first start, or when stored recent-device data is missing or malformed, the
  recent-devices list falls back to the three **built-in fictional sample
  devices** (each flagged `sample: true`). If you explicitly cleared the list,
  the stored empty array stays empty and is never overwritten by samples.

## Contributing and licence compatibility

When you modify or distribute the original components of this project you must
follow all obligations of AGPL-3.0-only, including the remote-network-interaction
clause (Section 13). If you intend to offer an online service built from a
derivative of this project, read `LICENSE` and the official GNU links above
first.
