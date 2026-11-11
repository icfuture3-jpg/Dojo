import { useCallback, useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GameHud } from './hud';
import { applyAction } from './actions';
import { loadSave, saveProfile, SAVE_KEY, type SaveStorage } from './saves';
import type { DojoEvent } from './net';

function browserStorage(): SaveStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function App() {
  const [loaded] = useState(() => loadSave(browserStorage(), Date.now()));
  const [profile, setProfile] = useState(loaded.profile);
  const [saveError, setSaveError] = useState('');
  const canSave = loaded.canSave;
  const [retry, setRetry] = useState(0);
  const [conflict, setConflict] = useState(false);
  const conflictRef = useRef(false);

  // Cross-tab synchronization listener
  useEffect(() => {
    const changed = (event: StorageEvent) => {
      if (event.key === SAVE_KEY) {
        conflictRef.current = true;
        setConflict(true);
        setSaveError(
          'Another tab changed this save. Automatic writes stopped. Export this session, then reload to use the other tab’s save.'
        );
      }
    };
    window.addEventListener('storage', changed);
    return () => window.removeEventListener('storage', changed);
  }, []);

  // Automatic saving on state changes
  useEffect(() => {
    if (!canSave || conflictRef.current) return;
    setSaveError(saveProfile(browserStorage(), profile) ?? '');
  }, [profile, retry, canSave]);

  // Action dispatcher with deterministic time/randomness guarantees
  const dispatch = useCallback((event: DojoEvent) => {
    event.message.send((kind, raw) => {
      // Read time/randomness outside React's updater so a replay stays deterministic.
      const now = Date.now();
      const random = (kind === 'openBox' || kind === 'academy') ? Math.random() : 0;
      setProfile(previous => applyAction(previous, kind, raw, now, random));
    });
  }, []);

  // Save exporter
  const exportSave = () => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dojo-progress.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const board = [{ id: 'local', name: profile.name || 'You (this device)', rp: profile.rp, wins: profile.stats.won, losses: Math.max(0, profile.stats.played - profile.stats.won) }];
  const warning = saveError || loaded.warning;

  return (
    <>
      <GameHud
        dispatch={dispatch}
        profileData={JSON.stringify(profile)}
        boardData={JSON.stringify(board)}
        boardId="local"
      />

      {/* Warning/Error Banner */}
      {warning && (
        <aside
          role="status"
          aria-label="Save status"
          style={{
            position: 'fixed',
            top: 8,
            left: 8,
            right: 8,
            zIndex: 1000,
            padding: 12,
            borderRadius: 8,
            background: '#392014',
            color: '#fff5d5',
            border: '2px solid #e9b34c',
            font: '14px/1.4 system-ui',
            maxHeight: '35dvh',
            overflow: 'auto',
          }}
        >
          <div>{warning}</div>
          {canSave && saveError && !conflict && (
            <button type="button" onClick={() => setRetry(n => n + 1)} style={{ margin: '8px 8px 0 0', minHeight: 44 }}>
              RETRY SAVE
            </button>
          )}
          {conflict && <button type="button" onClick={() => window.location.reload()} style={{ margin: '8px 8px 0 0', minHeight: 44 }}>RELOAD SAVED PROGRESS</button>}
          <button type="button" onClick={exportSave} style={{ marginTop: 8, minHeight: 44 }}>
            EXPORT THIS SESSION
          </button>
        </aside>
      )}
    </>
  );
}

// Mount point
createRoot(document.getElementById('root')!).render(<App />);
