import { useEffect } from 'react';
import { Alert, AppState, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import GestureItem, { type GestureItemProps } from './GestureItem';
import { type AudioClip, formatAudioTime } from './AudioRecorder';

type Props = Omit<GestureItemProps, 'children' | 'style' | 'onTap'> & {
    clip: AudioClip;
    recording: boolean;
};

export default function AudioComponent({ clip, recording, ...gestureProps }: Props) {
    const player = useAudioPlayer(clip.uri);
    const status = useAudioPlayerStatus(player);

    useEffect(() => {
        if (recording) player.pause();
    }, [recording, player]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (state) => {
            if (state !== 'active') player.pause();
        });
        return () => subscription.remove();
    }, [player]);

    const togglePlayback = async () => {
        if (recording) return;
        try {
            if (player.playing) {
                player.pause();
            } else {
                await setAudioModeAsync({
                    allowsRecording: false,
                    playsInSilentMode: true,
                    shouldRouteThroughEarpiece: false,
                });
                if (status.didJustFinish || (player.duration > 0 && player.currentTime >= player.duration)) {
                    await player.seekTo(0);
                }
                player.play();
            }
        } catch (error) {
            console.error('Audio playback failed:', error);
            Alert.alert('Could not play audio', 'Please try again.');
        }
    };

    return (
        <GestureItem {...gestureProps} onTap={togglePlayback} style={styles.card}>
            <View accessible accessibilityRole="button" accessibilityLabel={status.playing ? 'Pause recording' : 'Play recording'} onAccessibilityTap={togglePlayback} style={styles.row}>
                <Ionicons name={status.playing ? 'pause-circle' : 'play-circle'} size={40} color="#201e18db" />
                <View>
                    <Text style={styles.title}>Audio recording</Text>
                    <Text style={styles.time}>{formatAudioTime(status.currentTime)} / {formatAudioTime(clip.duration)}</Text>
                </View>
            </View>
            <Text style={styles.hint}>Tap to play</Text>
        </GestureItem>
    );
}

const styles = StyleSheet.create({
    card: { left: 40, top: 180, padding: 14, borderRadius: 16, color: '#201e18db', backgroundColor: '#f9f1d8' },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    title: { fontSize: 16, fontWeight: '600', color: '#201e18db' },
    hint: { marginTop: 8, fontSize: 11, color: '#201e1878' },
    time: { fontSize: 12, color: '#201e18db' },
});
