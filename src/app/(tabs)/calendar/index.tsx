import useToday from '@/hooks/useToday';
import { hasContent, useScrapbook } from '@/stores/scrapbook';
import { getDateKey, getMonthDate, getMonthDays, getMonthIndex } from '@/utils/calendar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ImageBackground, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CalendarScreen() {
    const today = useToday();
    const [pendingDate, setPendingDate] = useState<string | null>(null);
    const days = useScrapbook((state) => state.days);
    const currentMonth = getMonthIndex(today);
    const [browse, setBrowse] = useState({ anchor: currentMonth, month: currentMonth });
    // A new month automatically returns the calendar to the present.
    const month = browse.anchor === currentMonth ? Math.min(browse.month, currentMonth) : currentMonth;
    const title = getMonthDate(month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    const isCurrentMonth = month === currentMonth;
    const changeMonth = (step: number) => setBrowse({ anchor: currentMonth, month: Math.min(month + step, currentMonth) });

    const openDay = (date: string) => {
        router.push({ pathname: '/calendar/[date]', params: { date } });
    };
    const selectDay = (date: string) => {
        if (date === getDateKey(today)) router.navigate('/(tabs)');
        else if (hasContent(days[date])) openDay(date);
        else setPendingDate(date);
    };

    return (
        <>
            <ImageBackground
                source={require('../../../../assets/images/paper-texture.jpeg')}
                style={styles.background}
                imageStyle={styles.paperTexture}
            >
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
                                const date = day === null ? '' : getDateKey({ year: Math.floor(month / 12), month: month % 12, day });
                                const saved = hasContent(days[date]);
                                return (
                                    <View key={index} style={styles.cell}>
                                        {day !== null && (
                                            <Pressable accessibilityRole="button" disabled={future} accessibilityState={{ disabled: future }} accessibilityLabel={`${day} ${title}${isToday ? ', today' : ''}${saved ? ', saved scrapbook' : ''}`} onPress={() => selectDay(date)} style={[styles.day, isToday && styles.today]}>
                                                <Text style={[styles.dayText, future && styles.future, isToday && styles.todayText]}>{day}</Text>
                                                {saved && <View style={styles.savedDot} />}
                                            </Pressable>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                        <View style={styles.legend}>
                            <View style={styles.dot} />
                            <Text style={styles.caption}>Today</Text>
                            <View style={[styles.dot, { backgroundColor: '#3c6085' }]} />
                            <Text style={styles.caption}>Memories</Text>
                        </View>
                        {!isCurrentMonth && (
                            <Pressable accessibilityRole="button" onPress={() => setBrowse({ anchor: currentMonth, month: currentMonth })} style={({ pressed }) => [styles.returnButton, pressed && styles.pressed]}>
                                <Text>Back to this month</Text>
                            </Pressable>
                        )}
                    </View>
                </ScrollView>
            </ImageBackground>
            <Modal visible={pendingDate !== null} transparent animationType="fade" onRequestClose={() => setPendingDate(null)}>
                <View style={styles.overlay}>
                    <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="Cancel" onPress={() => setPendingDate(null)} />
                    <View style={styles.dialog} accessibilityViewIsModal>
                        <Text style={styles.dialogTitle}>This day has no memories</Text>
                        <View style={styles.actions}>
                            <Pressable accessibilityRole="button" style={styles.action} onPress={() => setPendingDate(null)}>
                                <Text>Cancel</Text>
                            </Pressable>
                            <Pressable accessibilityRole="button" style={[styles.action, styles.addAction]} onPress={() => {
                                if (!pendingDate) return;
                                const date = pendingDate;
                                setPendingDate(null);
                                openDay(date);
                            }}>
                                <Text style={styles.addLabel}>Add</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.35)' },
    dialog: { padding: 24, borderRadius: 20, backgroundColor: '#fff', gap: 20 },
    dialogTitle: { fontSize: 20, fontWeight: '600', textAlign: 'center' },
    actions: { flexDirection: 'row', gap: 12 },
    action: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#eee', alignItems: 'center' },
    addAction: { backgroundColor: '#000' },
    addLabel: { color: '#fff', fontWeight: '600' },
    background: { flex: 1, backgroundColor: '#a89e80' },
    screen: { flex: 1, backgroundColor: 'transparent' },
    paperTexture: { opacity: 0.4 },
    content: { flexGrow: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
    panel: { width: '100%', maxWidth: 520, padding: 16, borderRadius: 20, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
    title: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '600', color: '#201e18db' },
    arrow: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#201e18db', alignItems: 'center', justifyContent: 'center' },
    disabled: { opacity: 0.2 },
    pressed: { opacity: 0.6 },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    weekday: { width: '14.285714%', textAlign: 'center', fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 12 },
    cell: { width: '14.285714%', height: 48, alignItems: 'center', justifyContent: 'center' },
    day: { width: '100%', maxWidth: 40, aspectRatio: 1, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    savedDot: { position: 'absolute', bottom: 3, width: 5, height: 5, borderRadius: 3, backgroundColor: '#3c6085' },
    dayText: { fontSize: 16, color: '#000' },
    future: { color: '#999' },
    today: { backgroundColor: '#F4B8B8' },
    todayText: { color: '#6B2525', fontWeight: '700' },
    legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 },
    dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#F4B8B8' },
    caption: { fontSize: 12, color: '#666' },
    returnButton: { marginTop: 16, padding: 12, borderRadius: 10, backgroundColor: '#ddd', alignItems: 'center' },
});
