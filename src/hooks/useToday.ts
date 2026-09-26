import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { getToday } from '@/utils/calendar';

export default function useToday() {
    const [today, setToday] = useState(() => getToday());
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        const refresh = () => {
            clearTimeout(timer);
            const next = getToday();
            setToday((current) => current.year === next.year && current.month === next.month && current.day === next.day ? current : next);
            // Align with the next minute so the date changes at midnight.
            timer = setTimeout(refresh, 60000 - Date.now() % 60000);
        };
        refresh();
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') refresh();
        });
        return () => {
            clearTimeout(timer);
            subscription.remove();
        };
    }, []);
    return today;
}
