import useToday from '@/hooks/useToday';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
    const today = useToday();
    const formattedDate = new Date(Date.UTC(today.year, today.month, today.day, 12)).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone: 'UTC',
    });
    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: '#201e18db',
            tabBarInactiveTintColor: '#b4aa8be1',
            tabBarStyle: {
                backgroundColor: '#f9f1d8',
                height: 68,
                paddingTop: 6,
            },
            tabBarItemStyle: {
                justifyContent: 'center',
                alignItems: 'center',
            },
            tabBarLabelStyle: {
                fontSize: 12,
            },
        }}>
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
