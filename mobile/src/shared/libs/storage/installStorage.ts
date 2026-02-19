import * as SecureStore from 'expo-secure-store';

const INSTALL_ID_KEY = 'routine-note.install-id';
const INSTALL_TRACKED_KEY = 'routine-note.install-tracked';

const createInstallId = () =>
  `install-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const installStorage = {
  async getOrCreateInstallId() {
    const existingInstallId = await SecureStore.getItemAsync(INSTALL_ID_KEY);

    if (existingInstallId) {
      return existingInstallId;
    }

    const nextInstallId = createInstallId();
    await SecureStore.setItemAsync(INSTALL_ID_KEY, nextInstallId);
    return nextInstallId;
  },

  async isInstallTracked() {
    const tracked = await SecureStore.getItemAsync(INSTALL_TRACKED_KEY);
    return tracked === '1';
  },

  async markInstallTracked() {
    await SecureStore.setItemAsync(INSTALL_TRACKED_KEY, '1');
  },
};
