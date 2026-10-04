import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hotcodepush.demo.capacitor',
  appName: 'HotCodePush Demo',
  // The web view keeps clear of the status bar and the home indicator itself, so the page needs no inset padding.
  ios: { contentInset: 'always' },
  webDir: 'dist',
};

export default config;
