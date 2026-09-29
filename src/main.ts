import { HotCodePush } from '@hotcodepush/capacitor-live-updates';
import type {
  CheckResult,
  Release,
  SyncResult,
} from '@hotcodepush/capacitor-live-updates';

// Change it, build, release: the label is how you see the update land.
const VERSION = 'v1';

const versionHeading = getElement('version');
const currentReleaseText = getElement('current-release');
const deviceIdText = getElement('device-id');
const lastSyncText = getElement('last-sync');
const syncButton = getElement<HTMLButtonElement>('sync-button');

versionHeading.textContent = VERSION;
syncButton.addEventListener('click', () => void syncNow());
void showState();

async function showState(): Promise<void> {
  try {
    const [status, device] = await Promise.all([
      HotCodePush.getStatus(),
      HotCodePush.getDevice(),
    ]);
    currentReleaseText.textContent = resolveReleaseText(status.currentRelease);
    deviceIdText.textContent = device.id || 'none on the web';
    lastSyncText.textContent = status.lastCheck
      ? resolveResultText(status.lastCheck.result)
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

function resolveResultText(result: CheckResult | SyncResult): string {
  switch (result.status) {
    case 'UP_TO_DATE':
      return 'UP_TO_DATE';
    case 'AVAILABLE':
      return `AVAILABLE · ${resolveReleaseText(result.release)}`;
    case 'UPDATED':
      return `UPDATED · ${resolveReleaseText(result.release)}, installs ${result.installAt}`;
    case 'SKIPPED':
      return `SKIPPED · ${result.reason}`;
    case 'FAILED':
      return `FAILED · ${result.reason}: ${result.message}`;
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
