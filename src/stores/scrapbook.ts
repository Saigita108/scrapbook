import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import type { Sticker } from '@/components/StickerComponent';
import type { AudioClip } from '@/components/AudioRecorder';

export type Transform = { x: number; y: number; scale: number; rotation: number };
export type Day = {
    textElements: { id: string; text: string }[];
    imageElements: { id: string; uri: string; index: number }[];
    stickerElements: { id: string; sticker: Sticker }[];
    audioElements: (AudioClip & { id: string })[];
    videoElements: { id: string; uri: string }[];
    transforms: Record<string, Transform>;
};
export const emptyDay: Day = {
    textElements: [], imageElements: [], stickerElements: [], audioElements: [], videoElements: [], transforms: {},
};
export const hasContent = (day?: Day) => !!day && [day.textElements, day.imageElements, day.stickerElements, day.audioElements, day.videoElements].some((items) => items.length > 0);
type Collection = Exclude<keyof Day, 'transforms'>;
type ScrapbookStore = {
    days: Record<string, Day>;
    update: <K extends Collection>(date: string, key: K, action: Day[K] | ((current: Day[K]) => Day[K])) => void;
    transform: (date: string, id: string, value: Transform) => void;
    clear: (date: string) => void;
};
export const useStorageStatus = create<{ error: string | null }>(() => ({ error: null }));
// Serialize writes so a slower, older save cannot overwrite a newer edit.
let writes = Promise.resolve();
const storage: StateStorage = {
    getItem: (name) => AsyncStorage.getItem(name),
    setItem: (name, value) => {
        writes = writes.then(() => AsyncStorage.setItem(name, value)).then(() => {
            useStorageStatus.setState({ error: null });
        }).catch(() => {
            useStorageStatus.setState({ error: 'Could not save your changes. Check your device storage and try again.' });
        });
        return writes;
    },
    removeItem: (name) => AsyncStorage.removeItem(name),
};
export const useScrapbook = create<ScrapbookStore>()(persist((set) => ({
    days: {},
    update: (date, key, action) => set((state) => {
        const day = state.days[date] ?? emptyDay;
        const value = typeof action === 'function' ? action(day[key]) : action;
        return { days: { ...state.days, [date]: { ...day, [key]: value } } };
    }),
    transform: (date, id, value) => set((state) => {
        const day = state.days[date];
        const [kind, itemId] = id.split(':');
        const key = `${kind}Elements` as Collection;
        // Ignore a queued gesture callback after deletion or clearing the page.
        if (!day || !day[key]?.some((item) => item.id === itemId)) return state;
        return { days: { ...state.days, [date]: { ...day, transforms: { ...day.transforms, [id]: value } } } };
    }),
    clear: (date) => set((state) => {
        const days = { ...state.days };
        delete days[date];
        return { days };
    }),
}), {
    name: 'scrapbook-days', version: 1,
    storage: createJSONStorage(() => storage),
    partialize: (state) => ({ days: state.days }),
    skipHydration: true,
    onRehydrateStorage: () => (_state, error) => {
        if (error) useStorageStatus.setState({ error: 'Could not open your saved scrapbook. Please try again.' });
    },
}));
