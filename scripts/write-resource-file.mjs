// Stopgap until `npx hotcodepush bundle embed` lands (hotcodepush-team/cli#5), which replaces this script.
// Runs as the `capacitor:copy:after` hook: merges hotcodepush.json with the build-time facts the SDK
// requires and writes the resource file where the platform's native project reads it.
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';

const RESOURCE_FILE_PATHS = {
  android: 'android/app/src/main/assets/hotcodepush.json',
  ios: 'ios/App/App/hotcodepush.json',
};

const resourceFilePath =
  RESOURCE_FILE_PATHS[process.env.CAPACITOR_PLATFORM_NAME];
if (resourceFilePath) {
  const projectConfiguration = JSON.parse(
    await readFile('hotcodepush.json', 'utf8'),
  );
  const resourceFile = await buildResourceFile(projectConfiguration);
  await mkdir(dirname(resourceFilePath), { recursive: true });
  await writeFile(
    resourceFilePath,
    `${JSON.stringify(resourceFile, null, 2)}\n`,
  );
  console.log(`[HotCodePush] wrote ${resourceFilePath}`);
}

async function buildResourceFile(projectConfiguration) {
  const builtAt = new Date().toISOString();
  return {
    ...projectConfiguration,
    builtAt,
    embeddedBundleId: null,
    embeddedBundleManifest: {
      appId: projectConfiguration.appId,
      // An unregistered embedded bundle has neither an id nor a label; the SDK requires the fields, not the values.
      bundleId: 'embedded',
      createdAt: builtAt,
      files: await hashFiles(projectConfiguration.dir),
      version: '',
    },
    filesBaseUrl: process.env.HOTCODEPUSH_FILES_BASE_URL,
    fingerprint: null,
    updatesBaseUrl: process.env.HOTCODEPUSH_UPDATES_BASE_URL,
  };
}

async function hashFiles(directory) {
  const entries = await readdir(directory, {
    recursive: true,
    withFileTypes: true,
  });
  const files = await Promise.all(
    entries
      .filter(entry => entry.isFile())
      .map(entry => hashFile(directory, join(entry.parentPath, entry.name))),
  );
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

async function hashFile(directory, path) {
  const content = await readFile(path);
  return {
    path: relative(directory, path).split(sep).join('/'),
    sha256: createHash('sha256').update(content).digest('hex'),
    sizeBytes: content.length,
  };
}
