import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useToday from '@/hooks/useToday';

export default function TabLayout() {
    const today = useToday();
    const formattedDate = new Date(Date.UTC(today.year, today.month, today.day, 12)).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone: 'UTC',
    });
    return (
        <Tabs>
            <Tabs.Screen
                name="index"
                options={{
                    title: formattedDate,
                    tabBarLabel: 'Today',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="today-outline" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="calendar"
                options={{
                    title: 'Calendar',
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="calendar-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
