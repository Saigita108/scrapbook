import { Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import ScrapbookPage from '@/components/ScrapbookPage';

export default function DayScreen() {
    const { date } = useLocalSearchParams<{ date: string }>();
    const title = new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
    return <>
        <Stack.Screen options={{
            title,
            headerLeft: ({ tintColor }) => (
                <Pressable accessibilityRole="button" accessibilityLabel="Back to calendar" hitSlop={8}
                    style={{ padding: 8 }} onPress={() => router.dismissTo('/calendar')}>
                    <Ionicons name="arrow-back" size={24} color={tintColor ?? '#000'} />
                </Pressable>
            ),
        }} />
        <ScrapbookPage key={date} date={date} />
    </>;
}
