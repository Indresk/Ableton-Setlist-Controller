# Ableton Setlist Controller

Ableton Setlist Controller is a project focused on providing a flexible and intuitive way to manage live setlists in Arrangement View in Ableton Live, taking advantage of automation features for live performances. It is designed as a local web application to be used on devices connected to the same router.

The project consists of a Node.js backend that connects to Ableton via the `ableton-js` library and a React frontend that allows retrieving songs from Ableton, trigger individual songs and its sections, and organize them in setlists to play and save for later shows.

**What it does**

- Loads the current valid locators (see "Key instructions to retrieve information from Ableton") as songs and sections from the currently open Ableton project.
- Keeps tracking of time, tempo, and song position updates in the UI.
- Allows creating and saving setlists for future shows.
- Provides a drag & drop UI (touch-friendly) to reorder songs and to send play/stop commands to Ableton.
- Includes a setlist history in the UI to allow stepping back and forth between different order ideas.
- Displays a song progress bar that updates in real time based on Ableton's reported song position.

## Requirements

- Ableton Live (the project was developed on Live 12 Lite but should work with other Live versions)
- AbletonJS MIDI Remote Script (v4.1.0+): the Ableton-side MIDI remote script from https://github.com/leolabs/ableton-js

## Tech summary

- Backend: Node.js + Express + Socket.IO + `ableton-js` (apps/server)
- Frontend: React + Vite (apps/client)
- Persistence: SQLite accessed from a Worker Thread (`apps/server/src/db/db.worker.js`)
- IPC / realtime: Socket.IO for client-server state sync and commands to Ableton

## AbletonJS MIDI Remote Script setup

Install the AbletonJS MIDI Remote Script on the machine running Ableton Live:

- Download the folder "midi-script" from the AbletonJS repository (or latest release if the version is v4.1.0+). GitHub repo: https://github.com/leolabs/ableton-js
- Rename the downloaded folder `midi-script` (if present) to `AbletonJS`.
- Copy the `AbletonJS` folder into your Ableton Remote Scripts directory. Example path on Windows:

  ```
  C:\ProgramData\Ableton\Live 12 Lite\Resources\MIDI Remote Scripts
  ```

- In Ableton Live, set `AbletonJS` as your Remote Script.

## Key instructions to retrieve information from Ableton

- Songs and sections are delimited by locators in Arrangement View.
- All song locators must end with the "+" sign to be recognized as a song.
- After each song there should be a locator named "SONG END"; without this locator the song will not be recognized.
- All locators between "songname +" and "SONG END" will be considered sections of the song.
- Locator entries outside of song boundaries are ignored.

## Contributions

Contributions are welcome! Feel free to submit a pull request or open an issue if you have suggestions or improvements, you can see the development notes and where to start in [docs/development.md](docs/development.md).

## License

This project is licensed under the MIT License. See the LICENSE file for details.
