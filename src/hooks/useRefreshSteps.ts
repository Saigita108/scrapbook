import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { isDailyStepText, useScrapbook } from '@/stores/scrapbook';
import { getDateKey, getToday } from '@/utils/calendar';
import { getStepRange } from '@/utils/stepDates';

export default function useRefreshSteps(ready: boolean) {
    useEffect(() => {
        if (!ready || Platform.OS !== 'ios') return;
        let generation = 0;
        const refresh = async () => {
            const request = ++generation;
            const date = getDateKey(getToday());
            const ids = useScrapbook.getState().days[date]?.textElements
                .filter((item) => isDailyStepText(item, date)).map((item) => item.id) ?? [];
            if (!ids.length) return;
            try {
                // Refresh silently; permission is requested only when the user adds Steps.
                if (!(await Pedometer.getPermissionsAsync()).granted) return;
                if (!await Pedometer.isAvailableAsync()) return;
                const { start, end } = getStepRange(date);
                const { steps } = await Pedometer.getStepCountAsync(start, end);
                if (request !== generation || date !== getDateKey(getToday())) return;
                useScrapbook.getState().refreshDailySteps(date, steps, ids);
            } catch {
                // Keep the last saved count if the sensor or permission is unavailable.
            }
        };
        void refresh();
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') void refresh();
            else generation += 1;
        });
        return () => { generation += 1; subscription.remove(); };
    }, [ready]);
}
