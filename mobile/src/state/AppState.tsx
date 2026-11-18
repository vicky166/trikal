import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { birthProfileInputSchema, type BirthProfile, type BirthProfileInput } from '../domain/birthProfile';
import {
  DEVICE_STATE_KEY,
  createId,
  emptyDeviceState,
  parseDeviceState,
  type DevicePreview,
  type DeviceState,
} from './deviceState';

type AppActions = {
  hydrated: boolean;
  completeOnboarding: (language: DeviceState['language']) => void;
  setLanguage: (language: DeviceState['language']) => void;
  setThemeMode: (themeMode: DeviceState['themeMode']) => void;
  startPreview: (preview: DevicePreview) => void;
  endPreview: () => void;
  saveProfile: (input: BirthProfileInput, id?: string) => BirthProfile;
  setPrimary: (id: string) => void;
  clearDevice: () => void;
};

const AppStateContext = createContext<(DeviceState & AppActions) | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DeviceState>(emptyDeviceState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(DEVICE_STATE_KEY)
      .then((raw) => {
        if (active) {
          setState(parseDeviceState(raw));
          setHydrated(true);
        }
      })
      .catch(() => {
        if (active) {
          setHydrated(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    AsyncStorage.setItem(DEVICE_STATE_KEY, JSON.stringify(state)).catch(() => {
      // Storage failure leaves the in-memory session intact for this launch.
    });
  }, [hydrated, state]);

  const update = useCallback((patch: Partial<DeviceState>) => {
    setState((current) => ({ ...current, ...patch }));
  }, []);

  const saveProfile = useCallback((input: BirthProfileInput, id?: string) => {
    const parsed = birthProfileInputSchema.parse(input);
    const now = new Date().toISOString();
    const profileId = id ?? createId();
    const draft: BirthProfile = {
      ...parsed,
      id: profileId,
      createdAt: now,
      updatedAt: now,
    };
    setState((current) => {
      const existing = current.profiles.find((profile) => profile.id === profileId);
      const profile: BirthProfile = {
        ...draft,
        createdAt: existing?.createdAt ?? now,
      };
      const profiles = existing
        ? current.profiles.map((item) => (item.id === profile.id ? profile : item))
        : [profile, ...current.profiles];
      return {
        ...current,
        profiles,
        primaryProfileId: current.primaryProfileId ?? profile.id,
      };
    });
    return draft;
  }, []);

  const value = useMemo<DeviceState & AppActions>(
    () => ({
      ...state,
      hydrated,
      completeOnboarding: (language) => update({ onboardingComplete: true, language }),
      setLanguage: (language) => update({ language }),
      setThemeMode: (themeMode) => update({ themeMode }),
      startPreview: (preview) => update({ preview, onboardingComplete: true }),
      endPreview: () => update({ preview: null }),
      saveProfile,
      setPrimary: (id) => update({ primaryProfileId: id }),
      clearDevice: () => setState(emptyDeviceState()),
    }),
    [hydrated, saveProfile, state, update],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): DeviceState & AppActions {
  const value = useContext(AppStateContext);
  if (!value) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return value;
}

export function usePrimaryProfile(): BirthProfile | null {
  const { profiles, primaryProfileId } = useAppState();
  return profiles.find((profile) => profile.id === primaryProfileId) ?? profiles[0] ?? null;
}
