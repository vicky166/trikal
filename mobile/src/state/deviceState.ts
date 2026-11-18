import type { BirthProfile, BirthProfileInput } from '../domain/birthProfile';
import type { Language } from '../i18n/languages';

export type DevicePreview = {
  displayName: string;
  email: string;
};

export type DeviceState = {
  onboardingComplete: boolean;
  language: Language;
  themeMode: 'dark' | 'light';
  profiles: BirthProfile[];
  primaryProfileId: string | null;
  preview: DevicePreview | null;
};

export const emptyDeviceState = (): DeviceState => ({
  onboardingComplete: false,
  language: 'en',
  themeMode: 'dark',
  profiles: [],
  primaryProfileId: null,
  preview: null,
});

export const DEVICE_STATE_KEY = 'trikal.device.v1';

export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function parseDeviceState(raw: string | null): DeviceState {
  if (!raw) {
    return emptyDeviceState();
  }
  try {
    const value = JSON.parse(raw) as Partial<DeviceState>;
    const base = emptyDeviceState();
    return {
      ...base,
      ...value,
      profiles: Array.isArray(value.profiles) ? value.profiles : [],
      language: value.language === 'hi' || value.language === 'hinglish' ? value.language : 'en',
      themeMode: value.themeMode === 'light' ? 'light' : 'dark',
    };
  } catch {
    return emptyDeviceState();
  }
}
