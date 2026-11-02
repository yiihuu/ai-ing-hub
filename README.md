# AI-ing Hub

A local-first cross-AI session hub. It gathers your in-progress ChatGPT / Claude conversations into a card-grid gallery. Tap a card to jump back to the original chat; remove it when done. Nothing leaves your machine.

## Positioning

A project-oriented HCI prototype tackling the fragmentation of switching across multiple AIs while tracking in-progress tasks.

## Related Work

Existing cross-AI tools mostly start from history archiving, full-text search, or memory libraries. The entry point here is *real-time switching of in-progress tasks* — a live workspace switcher that reduces cross-AI context-switching from "hunting through windows" to "tapping a card in a grid", local-first and metadata-only.

Related work is summarised in the Related Work section below.

## Architecture

```
AI chat sources ──(browser extension capture)──▶ local hub service ──▶ gallery UI
 (ChatGPT/Claude)   title / URL / preview           (Node, 54321)      (card grid)
                                                        │
                                                 SSE live push
                                                        │
                                      tap card ──▶ window.open jumps back
```

- **Capture layer**: a browser extension injects a content script, periodically extracting `{provider, title, url, favicon, preview, ts}` and POSTing to the local service; a new conversation is registered automatically.
- **Hub server** `server.js`: zero-dependency Node; `POST /api/session` ingest, `DELETE /api/session?url=` remove, `GET /api/events` SSE live push; metadata only, no message bodies stored.
- **Gallery UI** `src/`: photos-style card grid, vendor filter, search, springy enter/exit animations.

## How to Run

**Quick start** — requires Node >= 18.

```bash
cd ai-ing-hub
node server.js
# open http://127.0.0.1:54321
```

**Browser extension (capture real conversations)**

1. Chrome / Edge → Extensions → enable Developer mode.
2. "Load unpacked" → select the `extension/` directory.
3. Open or start a ChatGPT / Claude conversation; a card appears automatically.

**Desktop (Tauri, optional)** — requires the Rust toolchain. The Node prototype already demonstrates the full concept.

## Structure

```
ai-ing-hub/
├── server.js              # local hub server (zero-dependency)
├── package.json
├── src/                   # gallery frontend
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── extension/             # browser extension capture layer
│   ├── manifest.json
│   ├── content.js
│   └── background.js
├── src-tauri/             # Tauri desktop shell
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── build.rs
│   ├── src/{main,lib}.rs
│   └── capabilities/default.json
└── sessions.json          # runtime-generated index (gitignored)
```

## Known Limitations

- Web-AI DOM structures change over time; the capture selectors need periodic updates. Currently only title / URL / short preview are scraped, keeping the fragile surface small.
- "Jump back" currently uses `window.open` to open / focus the URL; precise focus of an already-open tab requires bridging the extension background with the hub via the `chrome.tabs` API.
- Native desktop AI apps (local LLM clients, etc.) need a separate integration via their local logs / APIs.
- In-app language switching (i18n) is a planned feature.

## License

MIT.
