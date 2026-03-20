import { getBoardCardCount, type Board, type PersistedState, type ThemeMode } from '../lib/tintedFlow'
import { type StorageMode } from '../lib/persistence'
import { useDialogFocusTrap } from './useDialogFocusTrap'

type SettingsModalProps = {
  appState: PersistedState
  selectedBoard: Board | null
  isOpen: boolean
  isExporting: boolean
  latestReleaseVersion: string
  storageMode: StorageMode
  themeMode: ThemeMode
  onClose: () => void
  onCreateBoard: () => void
  onSelectBoard: (boardId: string) => void
  onDeleteBoard: (boardId: string) => void
  onSetThemeMode: (themeMode: ThemeMode) => void
  onDownloadPdf: () => void
  onExportData: () => void
  onImportData: () => void
  onViewLatestChangelog: () => void
  onClearAll: () => void
}

function SettingsModal({
  appState,
  selectedBoard,
  isOpen,
  isExporting,
  latestReleaseVersion,
  storageMode,
  themeMode,
  onClose,
  onCreateBoard,
  onSelectBoard,
  onDeleteBoard,
  onSetThemeMode,
  onDownloadPdf,
  onExportData,
  onImportData,
  onViewLatestChangelog,
  onClearAll,
}: SettingsModalProps) {
  const dialogRef = useDialogFocusTrap({ isOpen })

  if (!isOpen) {
    return null
  }

  return (
    <div className="settings-backdrop" onClick={onClose}>
      <section
        aria-labelledby="settings-title"
        aria-modal="true"
        className="settings-modal"
        onClick={(event) => event.stopPropagation()}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="settings-header">
          <div>
            <p className="eyebrow">Settings</p>
            <h2 id="settings-title">Workspace configuration</h2>
          </div>
          <button aria-label="Close settings" className="ghost-action" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <div className="settings-grid">
          <section className="settings-section">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Boards</p>
                <h3>Saved workspaces</h3>
              </div>
              <button className="ghost-action" onClick={onCreateBoard} type="button">
                New board
              </button>
            </div>

            <div className="board-list" role="list" aria-label="Saved boards">
              {appState.boards.length === 0 ? (
                <p className="panel-note">No boards saved yet.</p>
              ) : (
                appState.boards.map((board) => (
                  <article
                    className={board.id === selectedBoard?.id ? 'board-chip selected' : 'board-chip'}
                    key={board.id}
                    role="listitem"
                  >
                    <button className="board-chip-main" onClick={() => onSelectBoard(board.id)} type="button">
                      <span
                        aria-hidden="true"
                        className="board-chip-swatch"
                        style={{ backgroundColor: board.accent }}
                      />
                      <span>
                        <strong>{board.name}</strong>
                        <small>{getBoardCardCount(board)} cards</small>
                      </span>
                    </button>
                    <button
                      aria-label={`Delete ${board.name}`}
                      className="board-chip-delete"
                      onClick={() => onDeleteBoard(board.id)}
                      type="button"
                    >
                      Remove
                    </button>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="settings-section">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Appearance</p>
                <h3>Workspace appearance</h3>
              </div>
            </div>

            <div className="field-group">
              <span>Theme</span>
              <div className="theme-toggle" role="group" aria-label="Theme mode">
                <button
                  className={themeMode === 'light' ? 'active' : ''}
                  onClick={() => onSetThemeMode('light')}
                  type="button"
                >
                  Light
                </button>
                <button
                  className={themeMode === 'dark' ? 'active' : ''}
                  onClick={() => onSetThemeMode('dark')}
                  type="button"
                >
                  Dark
                </button>
              </div>
            </div>

            <p className="panel-note">
              Light mode is softer, dark mode keeps the same green accent, and column sizing lives on each board so layout changes happen where you are working.
            </p>
          </section>

          <section className="settings-section">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Data</p>
                <h3>Backup and recovery</h3>
              </div>
            </div>

            <div className="settings-action-stack">
              <button className="ghost-action" disabled={!selectedBoard || isExporting} onClick={onDownloadPdf} type="button">
                {!selectedBoard ? 'Download PDF requires a board' : isExporting ? 'Preparing PDF...' : 'Download current board PDF'}
              </button>
              <button className="ghost-action" onClick={onExportData} type="button">
                Export JSON backup
              </button>
              <button className="ghost-action" onClick={onImportData} type="button">
                Import JSON backup
              </button>
              <button className="ghost-action" onClick={onViewLatestChangelog} type="button">
                View changelog
              </button>
              <button className="ghost-action settings-danger" onClick={onClearAll} type="button">
                Clear all boards and local cache
              </button>
            </div>

            <p className="panel-note">
              Data stays on this browser unless you export a JSON backup. PDF export is a snapshot of the selected board, not a recovery format.
            </p>
            <p className="panel-note">Latest release notes: {latestReleaseVersion}.</p>
            <p className="panel-note">
              Drag a board card onto another in the sidebar to group them under one sidebar entry. You will be asked to confirm first, and grouped child boards can be unmerged from the main view.
            </p>
            {storageMode === 'memory' ? (
              <p className="panel-note settings-warning">
                Local storage is unavailable. Imports and edits will only last for this session until storage works again.
              </p>
            ) : null}
          </section>
        </div>
      </section>
    </div>
  )
}

export default SettingsModal