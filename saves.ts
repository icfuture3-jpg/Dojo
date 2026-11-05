import { applyLogin, parseProfile, profileSchema, type Profile } from './economy';

export const SAVE_KEY = 'dojo-profile-v1'; // Keep the existing key and raw-profile format.
export const BACKUP_KEY = `${SAVE_KEY}:backup`;
export const RECOVERY_KEY = `${SAVE_KEY}:recovery`;
export type SaveStorage = Pick<Storage, 'getItem' | 'setItem'>;
export interface LoadedSave { profile: Profile; warning: string; canSave: boolean }

function decode(text: string | null): Record<string, unknown> | null {
  if (!text) return null;
  try {
    const value = JSON.parse(text);
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
  } catch { return null; }
}
function future(value: Record<string, unknown> | null): boolean {
  return typeof value?.saveVersion === 'number' && value.saveVersion > 4;
}

function validSnapshot(data: Record<string, unknown> | null): boolean {
  return !!data && !future(data) && (data.saveVersion === undefined || [1, 2, 3, 4].includes(data.saveVersion as number))
    && profileSchema.safeParse({ ...data, saveVersion: 4 }).success;
}

export function loadSave(storage: SaveStorage | null, now: number): LoadedSave {
  const fresh = () => applyLogin(parseProfile({}), now);
  if (!storage) return { profile: fresh(), warning: 'Browser storage is unavailable. Progress is not being saved.', canSave: false };
  try {
    const text = storage.getItem(SAVE_KEY);
    const data = decode(text);
    if (future(data)) return { profile: fresh(), warning: 'This save comes from a newer game version. It has not been overwritten.', canSave: false };
    if (data) {
      return { profile: applyLogin(parseProfile(data), now), warning: validSnapshot(data) ? '' : 'Invalid save fields were repaired; valid progress was kept. The original snapshot is retained on the next successful save.', canSave: true };
    }
    const backup = decode(storage.getItem(BACKUP_KEY));
    if (validSnapshot(backup)) {
      return { profile: applyLogin(parseProfile(backup), now), warning: 'Recovered your previous backup. The damaged save is retained for recovery.', canSave: true };
    }
    if (text !== null) return { profile: fresh(), warning: 'Your save could not be read. The original is retained; automatic saving is disabled. Export this session before leaving.', canSave: false };
    return { profile: fresh(), warning: '', canSave: true };
  } catch {
    return { profile: fresh(), warning: 'Browser storage is blocked. Progress is not being saved. Export this session before leaving.', canSave: false };
  }
}

/** Retain the previous valid snapshot (or original damaged bytes) before replacing it. */
export function saveProfile(storage: SaveStorage | null, profile: Profile): string | null {
  if (!storage) return 'Browser storage is unavailable. Progress is not being saved.';
  try {
    const valid = profileSchema.safeParse(profile);
    if (!valid.success) return 'Progress could not be validated. The existing save has not been overwritten.';
    const current = storage.getItem(SAVE_KEY);
    if (future(decode(current))) return 'A newer-version save exists. It has not been overwritten.';
    const serialized = JSON.stringify(valid.data);
    if (current === serialized) return null;
    if (current !== null) {
      const parsed = decode(current);
      if (validSnapshot(parsed)) storage.setItem(BACKUP_KEY, current);
      else {
        // Do not overwrite the first retained damaged/legacy snapshot on subsequent saves.
        if (storage.getItem(RECOVERY_KEY) === null) storage.setItem(RECOVERY_KEY, current);
      }
    }
    storage.setItem(SAVE_KEY, serialized);
    return null;
  } catch {
    return 'Saving failed (storage may be blocked or full). Your progress remains in this session. Retry or export it before leaving.';
  }
}
