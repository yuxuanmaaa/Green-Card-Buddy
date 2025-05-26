import { AppSettings, DEFAULT_SETTINGS } from '../types/settings';

const SETTINGS_KEY = 'appSettings';

// 保存设置
export const saveSettings = async (settings: AppSettings): Promise<void> => {
  try {
    await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
  } catch (error) {
    console.error('Error saving settings:', error);
    throw new Error('Failed to save settings');
  }
};

// 获取设置
export const getSettings = async (): Promise<AppSettings> => {
  try {
    const data = await chrome.storage.local.get(SETTINGS_KEY);
    const savedSettings = data[SETTINGS_KEY];
    
    // 如果没有保存的设置，返回默认设置
    if (!savedSettings) {
      await saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }

    // 合并保存的设置和默认设置，确保所有必需的字段都存在
    return {
      ...DEFAULT_SETTINGS,
      ...savedSettings,
      // 确保这些字段有默认值
      notificationsEnabled: savedSettings.notificationsEnabled ?? DEFAULT_SETTINGS.notificationsEnabled,
      reminderDaysBefore: savedSettings.reminderDaysBefore ?? DEFAULT_SETTINGS.reminderDaysBefore,
      showBrowserNotifications: savedSettings.showBrowserNotifications ?? DEFAULT_SETTINGS.showBrowserNotifications,
      showInAppReminders: savedSettings.showInAppReminders ?? DEFAULT_SETTINGS.showInAppReminders,
      debugMode: savedSettings.debugMode ?? DEFAULT_SETTINGS.debugMode,
      useRealApi: savedSettings.useRealApi ?? DEFAULT_SETTINGS.useRealApi,
      uscisClientId: savedSettings.uscisClientId ?? DEFAULT_SETTINGS.uscisClientId,
      uscisClientSecret: savedSettings.uscisClientSecret ?? DEFAULT_SETTINGS.uscisClientSecret,
      uscisSandboxMode: savedSettings.uscisSandboxMode ?? DEFAULT_SETTINGS.uscisSandboxMode
    };
  } catch (error) {
    console.error('Error loading settings:', error);
    // 如果出错，返回默认设置
    return DEFAULT_SETTINGS;
  }
};

// 更新单个设置项
export const updateSetting = async <K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
): Promise<void> => {
  try {
    const currentSettings = await getSettings();
    const updatedSettings = { ...currentSettings, [key]: value };
    await saveSettings(updatedSettings);
  } catch (error) {
    console.error('Error updating setting:', error);
    throw new Error('Failed to update setting');
  }
};

// 重置设置为默认值
export const resetSettings = async (): Promise<void> => {
  try {
    await saveSettings(DEFAULT_SETTINGS);
  } catch (error) {
    console.error('Error resetting settings:', error);
    throw new Error('Failed to reset settings');
  }
}; 