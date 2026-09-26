import { Stack, useLocalSearchParams } from 'expo-router';
import ScrapbookPage from '@/components/ScrapbookPage';

export default function DayScreen() {
    const { date } = useLocalSearchParams<{ date: string }>();
    return <>
        <Stack.Screen options={{ title: date }} />
        <ScrapbookPage key={date} date={date} />
    </>;
}
