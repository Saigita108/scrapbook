import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import useToday from '@/hooks/useToday';
import { getMonthDate, getMonthDays, getMonthIndex } from '@/utils/calendar';

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CalendarScreen() {
    const today = useToday();
    const currentMonth = getMonthIndex(today);
    const [browse, setBrowse] = useState({ anchor: currentMonth, month: currentMonth });
    // A new month automatically returns the calendar to the present.
    const month = browse.anchor === currentMonth ? Math.min(browse.month, currentMonth) : currentMonth;
    const title = getMonthDate(month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    const isCurrentMonth = month === currentMonth;
    const changeMonth = (step: number) => setBrowse({ anchor: currentMonth, month: Math.min(month + step, currentMonth) });

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
            <View style={styles.panel}>
                <View style={styles.header}>
                    <Pressable accessibilityRole="button" accessibilityLabel="Previous month" onPress={() => changeMonth(-1)} style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}>
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </Pressable>
                    <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={styles.title}>{title}</Text>
                    <Pressable accessibilityRole="button" accessibilityLabel="Next month" accessibilityState={{ disabled: isCurrentMonth }} disabled={isCurrentMonth} onPress={() => changeMonth(1)} style={({ pressed }) => [styles.arrow, isCurrentMonth && styles.disabled, pressed && styles.pressed]}>
                        <Ionicons name="chevron-forward" size={24} color="#fff" />
                    </Pressable>
                </View>
                <View style={styles.grid}>
                    {weekdays.map((day) => <Text key={day} style={styles.weekday}>{day}</Text>)}
                    {getMonthDays(month).map((day, index) => {
                        const isToday = isCurrentMonth && day === today.day;
                        const future = isCurrentMonth && day !== null && day > today.day;
                        return (
                            <View key={index} style={styles.cell}>
                                {day !== null && (
                                    <View accessible accessibilityLabel={`${day} ${title}${isToday ? ', today' : ''}`} style={[styles.day, isToday && styles.today]}>
                                        <Text style={[styles.dayText, future && styles.future, isToday && styles.todayText]}>{day}</Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
                <View style={styles.legend}>
                    <View style={styles.dot} />
                    <Text style={styles.caption}>Today</Text>
                </View>
                {!isCurrentMonth && (
                    <Pressable accessibilityRole="button" onPress={() => setBrowse({ anchor: currentMonth, month: currentMonth })} style={({ pressed }) => [styles.returnButton, pressed && styles.pressed]}>
                        <Text>Back to this month</Text>
                    </Pressable>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#99895f' },
    content: { flexGrow: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
    panel: { width: '100%', maxWidth: 520, padding: 16, borderRadius: 20, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
    title: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '600', color: '#000' },
    arrow: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
    disabled: { opacity: 0.2 },
    pressed: { opacity: 0.6 },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    weekday: { width: '14.285714%', textAlign: 'center', fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 12 },
    cell: { width: '14.285714%', height: 48, alignItems: 'center', justifyContent: 'center' },
    day: { width: '100%', maxWidth: 40, aspectRatio: 1, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    dayText: { fontSize: 16, color: '#000' },
    future: { color: '#999' },
    today: { backgroundColor: '#F4B8B8' },
    todayText: { color: '#6B2525', fontWeight: '700' },
    legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 },
    dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#F4B8B8' },
    caption: { fontSize: 12, color: '#666' },
    returnButton: { marginTop: 16, padding: 12, borderRadius: 10, backgroundColor: '#ddd', alignItems: 'center' },
});
