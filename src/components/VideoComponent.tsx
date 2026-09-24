import { useEffect } from 'react';
import { Alert, AppState, StyleSheet, Text, View } from 'react-native';
import { useEvent } from 'expo';
import { setAudioModeAsync } from 'expo-audio';
import { useVideoPlayer, VideoView } from 'expo-video';
import Ionicons from '@expo/vector-icons/Ionicons';
import GestureItem, { type GestureItemProps } from './GestureItem';

type Props = Omit<GestureItemProps, 'children' | 'style' | 'onTap'> & {
    uri: string;
    recording: boolean;
};

export default function VideoComponent({ uri, recording, ...gestureProps }: Props) {
    const player = useVideoPlayer(uri, (video) => {
        video.muted = false;
        video.volume = 1;
        video.audioMixingMode = 'doNotMix';
    });
    const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
    const { status } = useEvent(player, 'statusChange', { status: player.status });

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
                if (player.status === 'error') {
                    Alert.alert('Could not play video', 'Try recording the video again.');
                    return;
                }
                await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
                if (player.duration > 0 && player.currentTime >= player.duration) player.replay();
                else player.play();
            }
        } catch {
            Alert.alert('Could not play video', 'Please try again.');
        }
    };

    return (
        <GestureItem {...gestureProps} onTap={togglePlayback} style={styles.card}>
            <View
                accessible
                accessibilityRole="button"
                accessibilityLabel={isPlaying ? 'Pause video' : 'Play video with sound'}
                onAccessibilityTap={togglePlayback}
            >
                <View pointerEvents="none">
                    <VideoView
                        player={player}
                        style={styles.video}
                        nativeControls={false}
                        contentFit="contain"
                        surfaceType="textureView"
                    />
                </View>
                <View style={styles.controls}>
                    <Ionicons name={isPlaying ? 'pause-circle' : 'play-circle'} size={24} color="#39362b" />
                    <Text style={styles.hint}>
                        {status === 'error' ? 'Could not load video' : status === 'loading' ? 'Loading video…' : isPlaying ? 'Tap to pause' : 'Tap to play'}
                    </Text>
                </View>
            </View>
        </GestureItem>
    );
}

const styles = StyleSheet.create({
    card: { left: 40, top: 100, padding: 8, borderRadius: 16, backgroundColor: '#f5ecd6' },
    video: { width: 200, height: 200, borderRadius: 10, backgroundColor: '#000' },
    controls: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 8 },
    hint: { fontSize: 11, color: '#666' },
});
