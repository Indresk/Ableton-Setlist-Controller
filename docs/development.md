# Development information

Here is located all information related to the development of the project, including installation dev environment instructions, important design decisions, and known issues that need to be addressed.

## Development requirements

- Ableton Live (the project was developed on Live 12 Lite but should work with other Live versions)
- AbletonJS MIDI Remote Script (v4.1.0+): the Ableton-side MIDI remote script from https://github.com/leolabs/ableton-js
- Node.js (v22.5+ recommended to ensure SQLite native app compatibility and v25.5+ if you want to compile it on your own with SEA module)
- npm (or a compatible package manager)

## Where to start if you want to contribute

- Reproduce the persistence duplication case: save a setlist, change order, save again, inspect `apps/server/src/db/setlist.db` or the `setlist_songs` entries.
- Investigate `useCueHistory` and the `CueContainer.jsx` + `hooks/useCueHistory.js` code paths.

## Implementation notes and important design decisions

- Ableton is treated as the source of truth for live song data. The database stores only metadata and ordering — not the live state of Ableton objects.
- Persistence is handled via a dedicated worker to improve performance by decoupling client updates from DB updates: see [apps/server/src/db/db.worker.js](apps/server/src/db/db.worker.js#L1).
- The SQLite schema enforces a uniqueness constraint on `(setlist_id, ableton_song_id)` in [apps/server/src/db/schema.js](apps/server/src/db/schema.js#L1).

## Dev installation instructions

1. Install the AbletonJS MIDI Remote Script on the machine running Ableton Live:
   - Download the folder "midi-script" from the AbletonJS repository (or latest release if the version is v4.1.0+). GitHub repo: https://github.com/leolabs/ableton-js
   - Rename the downloaded folder `midi-script` (if present) to `AbletonJS`.
   - Copy the `AbletonJS` folder into your Ableton Remote Scripts directory. Example path on Windows:

     ```
     C:\ProgramData\Ableton\Live 12 Lite\Resources\MIDI Remote Scripts
     ```

   - In Ableton Live, set `AbletonJS` as your Remote Script.

2. From the repository root, install dependencies (workspace install):
   ```
   npm install
   ```
3. Start both server and client in development mode (concurrently):

   ```
   npm run dev
   ```

4. Or run them independently:
   - Runs server with node --watch on apps/server

     ```
     npm run dev:server
     ```

   - Runs Vite dev server for the client

     ```
     npm run dev:client
     ```

5. Production-ish flow (build client, start server):
   - builds client (apps/client)

     ```
     npm run build
     ```

   - builds and starts server

     ```
     npm run start:dev
     ```

   - to start the server without building (assumes client is already built)

     ```
     npm start
     ```

The server exposes a health endpoint at `/health` and starts on `PORT` (default 3000).

## Windows build instructions

To build the project we have two paths depending if you have Node 25.5+ with SEA module support or not, you can review it in the following doc: [docs/build.md](docs/build.md).

## Known issues and important TODOs

The project is actively under development and has a few important issues that must be addressed. These are prioritized and partially captured in the internal audit roadmap.

- **Delete setlist setlist/items**: Implement functionality to delete individual songs or sections from a setlist and delete setlists. This requires both UI components (e.g. delete buttons) and backend API endpoints to handle deletions, along with database operations to remove the corresponding entries.

- **Persistence / duplicate instances**: When saving setlists the DB may end up storing multiple instances of the "same" song across different orders or sessions. This is likely caused by using the ephemeral Ableton `song.id` as a persistent key — Ableton IDs can change between sessions. This could be solved by using `song.name` plus a normalized identifier (or a user-provided persistent id), deduplicating before saving, and updating the persist/load logic to avoid creating duplicate song entries for a single logical track.

- **Cue history bugs**: The UI history system (`useCueHistory` / cue navigation) exhibits small bugs when stepping back and forth, apparently related to persistence and multiple song instances. This needs investigation after addressing persistence to ensure the history stack consistently references canonical song items.

### Audit roadmap (higher priority items from internal audit)

- Isolate state mutability on the backend: stop returning live references from `getState()`; return frozen clones instead.
- Optimize React DnD rendering: avoid deep `JSON.stringify` comparisons each render; derive dirty flags from ID-level diffs.

**Where to look in the codebase**

- Server entry: [apps/server/src/index.js](apps/server/src/index.js#L1)
- DB worker and persistence: [apps/server/src/db/db.worker.js](apps/server/src/db/db.worker.js#L1)
- SQLite schema: [apps/server/src/db/schema.js](apps/server/src/db/schema.js#L1)
- Client app: [apps/client/src](apps/client/src)
