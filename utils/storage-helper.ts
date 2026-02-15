/** Chrome storage helpers for API key and cached results */

import type { ExtensionSettings, GenerationResult } from './shared-types';

const SETTINGS_KEY = 'eliteapply_settings';
const LAST_RESULT_KEY = 'eliteapply_last_result';

export async function getSettings(): Promise<ExtensionSettings> {
  const data = await browser.storage.local.get(SETTINGS_KEY);
  return (data[SETTINGS_KEY] as ExtensionSettings | undefined) ?? { openrouterApiKey: '' };
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  await browser.storage.local.set({ [SETTINGS_KEY]: settings });
}

export async function getLastResult(): Promise<GenerationResult | null> {
  const data = await browser.storage.local.get(LAST_RESULT_KEY);
  return (data[LAST_RESULT_KEY] as GenerationResult | undefined) ?? null;
}

export async function saveLastResult(result: GenerationResult): Promise<void> {
  await browser.storage.local.set({ [LAST_RESULT_KEY]: result });
}
