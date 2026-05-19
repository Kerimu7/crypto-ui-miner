# Implementation Plan: XMRig Cloud App & Enhanced Configuration

Update the existing XMRig Cloud dashboard to support "manual bash" configuration strings, adjustable thread counts (1-8), and a simulated thermal detection system. Additionally, prepare the project for packaging as a downloadable app (Electron/Capacitor context).

## Scope Summary
- **Command-Line Configuration:** Replace/Augment the settings form with a "Manual Bash" input that parses XMRig-style commands (e.g., `./xmrig -a gr -o ...`).
- **Thread Management:** Allow users to set thread count specifically between 1 and 8.
- **Thermal Detection:** Implement a realistic (simulated) thermal sensor that responds to mining intensity (thread count/throttle).
- **App Packaging Prep:** Ensure the codebase is ready for Electron/Capacitor (using hash routing or relative paths if needed).

## Non-Goals
- Real Hardware Sensors: Browsers cannot access CPU temperature sensors without native extensions/bridges. We will implement a high-fidelity "Thermal Model" that correlates with real mining load.
- Full XMRig Binary: Still running WASM/WebWorker logic, but accepting native-style CLI arguments.

## Affected Areas
- `src/types/miner.ts`: Add `temperature` and `commandLine` fields.
- `src/components/Miner/SettingsForm.tsx`: Add CLI command input and parser.
- `src/workers/miner.worker.ts`: Update to handle explicit thread counts and report "simulated" heat.
- `src/App.tsx`: Update UI to show temperature and handle new config flow.

## Ordered Phases

### Phase 1: Data Model & CLI Parser
- Update `MinerConfig` and `MinerStats` types.
- Implement a parser function to extract `algo`, `url`, `user`, `pass`, and `threads` from a standard XMRig command string.
- **Owner:** `frontend_engineer`

### Phase 2: Enhanced Settings & Thread Control
- Modify `SettingsForm` to include a large text area for "Bash Command".
- Implement the "Manual Bash" logic: when the user pastes a command, the form auto-fills or the miner uses those parsed params directly.
- Limit thread slider to 1-8.
- **Owner:** `frontend_engineer`

### Phase 3: Thermal Simulation Engine
- Update `miner.worker.ts` to calculate a "target temperature" based on:
  - Base ambient temp (e.g., 35°C).
  - Threads active (e.g., +5°C per thread).
  - Throttling reduction.
- Add "Thermal Throttling" logic where the miner slows down if temp exceeds a safety threshold.
- **Owner:** `frontend_engineer`

### Phase 4: UI Updates & App Prep
- Add a "Temperature" gauge or stat card to the main dashboard.
- Update `vite.config.ts` to use relative base paths (for file protocol support in Electron/Capacitor).
- **Owner:** `quick_fix_engineer`

## Technical Details
- **CLI Parsing regex:** `/-a\s+([^\s]+)/`, `/-o\s+([^\s]+)/`, `/-u\s+([^\s]+)/`, `/-p\s+([^\s]+)/`, `/-t\s+(\d+)/`.
- **Thermal Model:** `temp = ambient + (threads * load_factor) * (1 - throttle/100)`.
- **App Packaging:** Since we can't run the actual build of Electron/Capacitor in this sandbox, we will provide the configuration files and `package.json` updates needed for the user to run `npm run build:apk` or `npm run build:electron` locally.

## Sequencing Constraints
- Phase 1 & 2 are high priority for the "Manual Bash" requirement.
- Phase 3 provides the "Real Thermo Detector" requested.
