import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import { useEffect, useRef, useState } from 'react';
import { Alert, AppState, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export type AudioClip = { uri: string; duration: number };

export function formatAudioTime(seconds: number) {
    const whole = Math.max(0, Math.floor(seconds));
    return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

type Props = { onSave: (clip: AudioClip) => void | Promise<void>; onCancel: () => void };

export default function AudioRecorder({ onSave, onCancel }: Props) {
    const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const status = useAudioRecorderState(recorder, 100);
    const [phase, setPhase] = useState<'idle' | 'recording' | 'paused' | 'stopped'>('idle');
    const [busy, setBusy] = useState(false);
    const locked = useRef(false);
    const prepared = useRef(false);
    const savedClip = useRef<AudioClip | null>(null);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (state) => {
            if (state !== 'active' && recorder.getStatus().isRecording) {
                recorder.pause();
                setPhase('paused');
            }
        });
        return () => {
            subscription.remove();
            void setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(console.error);
        };
    }, [recorder]);

    const perform = async (action: () => Promise<void>) => {
        if (locked.current) return;
        locked.current = true;
        setBusy(true);
        try {
            await action();
        } catch (error) {
            console.error('Audio recording failed:', error);
            Alert.alert('Audio recording failed', 'Please try again.');
        } finally {
            locked.current = false;
            setBusy(false);
        }
    };

    const recordOrPause = () => perform(async () => {
        if (recorder.getStatus().isRecording) {
            recorder.pause();
            setPhase('paused');
            return;
        }
        if (!prepared.current) {
            const permission = await AudioModule.requestRecordingPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Microphone access needed', permission.canAskAgain
                    ? 'Allow microphone access to record audio.'
                    : 'Enable microphone access for Scrapbook in your device settings.');
                return;
            }
            await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
            await recorder.prepareToRecordAsync();
            prepared.current = true;
        }
        recorder.record();
        setPhase('recording');
    });

    const save = () => perform(async () => {
        if (!savedClip.current) {
            const duration = recorder.getStatus().durationMillis / 1000;
            if (duration <= 0) return;
            await recorder.stop();
            prepared.current = false;
            setPhase('stopped');
            if (!recorder.uri) throw new Error('No recording file was created');
            savedClip.current = { uri: recorder.uri, duration };
        }
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
        await onSave(savedClip.current);
    });

    const cancel = () => perform(async () => {
        try {
            if (prepared.current) await recorder.stop();
        } finally {
            await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
            onCancel();
        }
    });

    const duration = savedClip.current?.duration ?? status.durationMillis / 1000;
    const canSave = !busy && phase !== 'idle' && duration > 0;

    return (
        <Modal transparent animationType="fade" onRequestClose={cancel}>
            <View style={styles.overlay}>
                <View style={styles.panel}>
                    <Text style={styles.title}>Record audio</Text>
                    <Text style={styles.timer}>{formatAudioTime(duration)}</Text>
                    <Text style={styles.status}>{phase === 'recording' ? 'Recording…' : phase === 'paused' ? 'Paused' : phase === 'stopped' ? 'Ready to save' : 'Ready to record'}</Text>
                    <Pressable disabled={busy || phase === 'stopped'} onPress={recordOrPause} style={[styles.record, (busy || phase === 'stopped') && styles.disabled]} accessibilityRole="button">
                        <Text style={styles.recordLabel}>{phase === 'recording' ? 'Pause' : phase === 'paused' ? 'Resume recording' : 'Record'}</Text>
                    </Pressable>
                    <View style={styles.actions}>
                        <Pressable disabled={busy} onPress={cancel} style={styles.button} accessibilityRole="button"><Text style={styles.buttonLabel}>Cancel</Text></Pressable>
                        <Pressable disabled={!canSave} onPress={save} style={[styles.button, !canSave && styles.disabled]} accessibilityRole="button"><Text style={styles.buttonLabel}>Save</Text></Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.35)' },
    panel: { padding: 24, borderRadius: 20, backgroundColor: '#f9f1d8', gap: 16 },
    title: { fontSize: 20, fontWeight: '600', textAlign: 'center', color: '#201e18db' },
    timer: { fontSize: 36, textAlign: 'center', fontVariant: ['tabular-nums'], color: '#201e18db' },
    status: { textAlign: 'center', color: '#201e18db' },
    record: { padding: 16, borderRadius: 12, backgroundColor: '#ad5252', alignItems: 'center' },
    recordLabel: { color: '#f9f1d8', fontWeight: '600' },
    actions: { flexDirection: 'row', gap: 12 },
    button: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#201e18db', alignItems: 'center' },
    buttonLabel: { color: '#f9f1d8' },
    disabled: { opacity: 0.4 },
});
