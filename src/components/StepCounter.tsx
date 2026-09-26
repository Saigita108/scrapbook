import { getDateKey, getToday } from '@/utils/calendar';
import { getStepRange } from '@/utils/stepDates';
import { Pedometer } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, Linking, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { date: string; onAdd: (text: string, source: 'daily' | 'session') => void; onClose: () => void };

export default function StepCounter({ date, onAdd, onClose }: Props) {
    const [steps, setSteps] = useState<number | null>(null);
    const [busy, setBusy] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [settings, setSettings] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const [stopped, setStopped] = useState(false);
    const session = Platform.OS === 'android';

    useEffect(() => {
        let active = true;
        let subscription: ReturnType<typeof Pedometer.watchStepCount> | undefined;
        setBusy(true);
        setSteps(null);
        setError(null);
        setSettings(false);
        setStopped(false);
        const read = async () => {
            try {
                if (Platform.OS === 'web') throw new Error('Open Scrapbook on an iPhone or Android phone to read its step counter.');
                if (session && date !== getDateKey(getToday())) throw new Error('On Android, you can count live steps on Today. Previous daily totals are not available.');
                const range = session ? null : getStepRange(date);
                const permission = await Pedometer.requestPermissionsAsync();
                if (!active) return;
                if (!permission.granted) {
                    setSettings(!permission.canAskAgain);
                    throw new Error('Allow Motion & Fitness or Physical Activity access to read your steps.');
                }
                if (!await Pedometer.isAvailableAsync()) throw new Error('A step counter is not available on this device. Try a physical phone.');
                if (!active) return;
                if (session) {
                    if (AppState.currentState !== 'active') throw new Error('Keep Scrapbook open to start counting steps.');
                    setSteps(0);
                    subscription = Pedometer.watchStepCount((result) => {
                        if (active) setSteps(result.steps);
                    });
                } else if (range) {
                    const result = await Pedometer.getStepCountAsync(range.start, range.end);
                    if (active) setSteps(result.steps);
                }
            } catch (cause) {
                if (active) setError(cause instanceof Error ? cause.message : 'Could not read steps. Please try again.');
            } finally {
                if (active) setBusy(false);
            }
        };
        void read();
        const appState = AppState.addEventListener('change', (state) => {
            // Freeze a live session when leaving the app; never claim background coverage.
            if (session && state !== 'active' && subscription) {
                subscription.remove();
                subscription = undefined;
                setStopped(true);
            }
        });
        return () => { active = false; subscription?.remove(); appState.remove(); };
    }, [date, session, attempt]);

    return <Modal transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.overlay}>
            <View style={styles.panel} accessibilityViewIsModal>
                <Text style={styles.title}>{session ? 'Count a walk' : 'Steps for this day'}</Text>
                {busy ? <ActivityIndicator /> : steps !== null && <Text style={styles.count}>{steps.toLocaleString()} steps</Text>}
                <Text style={styles.caption}>{session ? 'Steps counted during this walking session.' : 'Today’s saved steps refresh when you reopen the app.'}</Text>
                {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
                {settings && <Pressable accessibilityRole="button" onPress={() => void Linking.openSettings()} style={styles.action}><Text>Open settings</Text></Pressable>}
                {error && Platform.OS !== 'web' && <Pressable accessibilityRole="button" onPress={() => setAttempt((value) => value + 1)} style={styles.action}><Text>Try again</Text></Pressable>}
                <View style={styles.actions}>
                    <Pressable accessibilityRole="button" onPress={onClose} style={styles.action}><Text>Cancel</Text></Pressable>
                    <Pressable accessibilityRole="button" disabled={busy || steps === null || !!error}
                        style={[styles.action, styles.add, (busy || steps === null || !!error) && styles.disabled]}
                        onPress={() => {
                            if (steps === null) return;
                            onAdd(`${steps.toLocaleString()} steps`, 'daily');
                        }}><Text style={styles.addText}>Add</Text></Pressable>
                </View>
            </View>
        </View>
    </Modal>;
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.35)' },
    panel: { padding: 24, borderRadius: 20, backgroundColor: '#fff', gap: 16 },
    title: { fontSize: 20, fontWeight: '600', textAlign: 'center' },
    count: { fontSize: 32, fontWeight: '700', textAlign: 'center' },
    caption: { color: '#666', textAlign: 'center' },
    error: { color: '#a32929' },
    actions: { flexDirection: 'row', gap: 10 },
    action: { flexGrow: 1, padding: 12, borderRadius: 10, backgroundColor: '#ddd', alignItems: 'center' },
    add: { backgroundColor: '#000' },
    addText: { color: '#fff' },
    disabled: { opacity: 0.4 },
});
