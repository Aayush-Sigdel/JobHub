export const BOOKMARK_STORAGE_KEY = "jobhub_saved_jobs";
export const STORAGE_OWNER_KEY = "jobhub_storage_owner_v1";
const SIGNED_OUT = "signed-out";

/** Bookmarks are deliberately shared on this browser; everything else is temporary. */
export function clearLocalSessionData() {
  if (typeof window === "undefined") return;

  try {
    const storage = window.localStorage;
    for (let index = storage.length - 1; index >= 0; index--) {
      const key = storage.key(index);
      if (key !== null && key !== BOOKMARK_STORAGE_KEY) storage.removeItem(key);
    }
  } catch {
    // Disabled storage must not prevent signing out.
  }
  try {
    window.sessionStorage.clear();
  } catch {
    // Session storage can be disabled independently of local storage.
  }
  window.dispatchEvent(new Event("jobhub_in_progress_jobs_changed"));
  window.dispatchEvent(new Event("job-assessment-submission"));
}

/** Clear legacy records and account changes, but retain drafts on same-user reloads. */
export function synchronizeLocalSession(userId: string | null) {
  if (typeof window === "undefined") return;
  const owner = userId ? `user:${userId}` : SIGNED_OUT;
  try {
    if (window.localStorage.getItem(STORAGE_OWNER_KEY) !== owner) {
      clearLocalSessionData();
      window.localStorage.setItem(STORAGE_OWNER_KEY, owner);
    }
  } catch {
    // The app remains usable without persistent browser storage.
  }
  try {
    if (window.sessionStorage.getItem(STORAGE_OWNER_KEY) !== owner) {
      window.sessionStorage.clear();
      window.sessionStorage.setItem(STORAGE_OWNER_KEY, owner);
    }
  } catch {
    // Assessment monitoring also has an in-memory fallback.
  }
}

export function userStorageKey(userId: string | undefined, key: string) {
  if (!userId || typeof window === "undefined") return undefined;
  try {
    // An old tab or a delayed submission must not write after another account signs in.
    if (window.localStorage.getItem(STORAGE_OWNER_KEY) !== `user:${userId}`) {
      return undefined;
    }
    return `jobhub:user:${encodeURIComponent(userId)}:${key}`;
  } catch {
    return undefined;
  }
}
