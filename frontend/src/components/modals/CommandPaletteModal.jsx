import {
  closeCommandPalette,
  closeCommandPaletteOnBackdrop,
  handleCommandPaletteSearch,
} from '@/features/commandPalette/commandPalette.js';

/** Ctrl/Cmd + K command palette. */
export default function CommandPaletteModal() {
  return (
    <div
      className="command-palette-overlay"
      id="commandPaletteModal"
      onClick={(event) => closeCommandPaletteOnBackdrop(event)}
      aria-hidden="true"
    >
      <div className="command-palette-card" role="dialog" aria-modal="true" aria-label="Command Palette">
        <div className="command-palette__header">
          <i className="ph-bold ph-magnifying-glass command-palette__search-icon" />
          <input
            type="text"
            id="commandPaletteInput"
            className="command-palette__input"
            placeholder="Search cities, services, or workspaces (e.g. Mumbai, Coworking, GST)..."
            autoComplete="off"
            spellCheck="false"
            onInput={(event) => handleCommandPaletteSearch(event.currentTarget.value)}
          />
          <span className="command-palette__esc-badge" onClick={() => closeCommandPalette()}>
            <kbd>ESC</kbd>
          </span>
        </div>
        <div className="command-palette__body" id="commandPaletteResults" />
        <div className="command-palette__footer">
          <div className="command-palette__hints">
            <span>
              <kbd>↑</kbd> <kbd>↓</kbd> Navigate
            </span>
            <span>
              <kbd>↵</kbd> Select
            </span>
            <span>
              <kbd>ESC</kbd> Close
            </span>
          </div>
          <div className="command-palette__status">
            <span className="pulse-indicator" />
            V-DESK Instant Finder
          </div>
        </div>
      </div>
    </div>
  );
}
