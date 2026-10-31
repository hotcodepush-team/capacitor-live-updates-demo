import { HotCodePush } from '@hotcodepush/capacitor-live-updates';
import type { Release, SyncResult } from '@hotcodepush/capacitor-live-updates';

// Change this label before each release to see the update land on the device.
const VERSION = 'v1';

const versionHeading = getElement('version');
const currentReleaseText = getElement('current-release');
const deviceIdText = getElement('device-id');
const lastSyncText = getElement('last-sync');
const lastRollbackText = getElement('last-rollback');
const syncButton = getElement<HTMLButtonElement>('sync-button');
const debugButton = getElement<HTMLButtonElement>('debug-button');

versionHeading.textContent = VERSION;
syncButton.addEventListener('click', () => void syncNow());
debugButton.addEventListener('click', () => void HotCodePush.showDebugScreen());
// The SDK fires this once, on the first start after a rollback.
void HotCodePush.addListener('updateRolledBack', event => {
  lastRollbackText.textContent = `from ${resolveReleaseText(event.fromRelease)} · ${event.reason}`;
});
void showState();

async function showState(): Promise<void> {
  try {
    const [state, device] = await Promise.all([
      HotCodePush.getState(),
      HotCodePush.getDevice(),
    ]);
    currentReleaseText.textContent = resolveReleaseText(state.currentRelease);
    deviceIdText.textContent = device.id ?? 'none yet';
    lastSyncText.textContent = state.lastCheck
      ? resolveResultText(state.lastCheck.result)
      : 'none yet';
  } catch (error) {
    currentReleaseText.textContent = resolveErrorText(error);
  }
}

async function syncNow(): Promise<void> {
  syncButton.disabled = true;
  lastSyncText.textContent = 'syncing…';
  try {
    const result = await HotCodePush.sync();
    await showState();
    lastSyncText.textContent = resolveResultText(result);
  } catch (error) {
    lastSyncText.textContent = resolveErrorText(error);
  } finally {
    syncButton.disabled = false;
  }
}

function resolveReleaseText(release: Release | null): string {
  return release ? `#${release.number} · ${release.bundleVersion}` : 'embedded';
}

function resolveResultText(result: SyncResult): string {
  switch (result.status) {
    case 'up_to_date':
      return 'up_to_date';
    case 'available':
      return `available · ${resolveReleaseText(result.release)}`;
    case 'downloaded':
      return `downloaded · ${resolveReleaseText(result.release)}, applies ${result.applyStrategy}`;
    case 'applied':
      return `applied · ${resolveReleaseText(result.release)}`;
    case 'skipped':
      return `skipped · ${result.reason}`;
    case 'failed':
      return `failed · ${result.reason}: ${result.message}`;
  }
}

function resolveErrorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function getElement<T extends HTMLElement = HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`#${id} is missing from index.html`);
  }
  return element as T;
}
