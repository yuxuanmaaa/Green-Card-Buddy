import { AppSettings, DEFAULT_SETTINGS } from '../types/settings';

const SETTINGS_KEY = 'appSettings';

// 保存设置
export const saveSettings = async (settings: AppSettings): Promise<void> => {
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
};

// 获取设置
export const getSettings = async (): Promise<AppSettings> => {
  const data = await chrome.storage.local.get(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...data[SETTINGS_KEY] };
};

// 更新单个设置项
export const updateSetting = async <K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
): Promise<void> => {
  const currentSettings = await getSettings();
  const updatedSettings = { ...currentSettings, [key]: value };
  await saveSettings(updatedSettings);
};

// 重置设置为默认值
export const resetSettings = async (): Promise<void> => {
  await saveSettings(DEFAULT_SETTINGS);
}; 