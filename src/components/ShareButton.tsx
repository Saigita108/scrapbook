import { useEffect, useRef, useState, type RefObject } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { captureRef, releaseCapture } from 'react-native-view-shot';
import { sharePng } from '@/utils/exportPng';

type Props = { canvas: RefObject<View | null>; date: string; disabled: boolean; onOpen: () => void; onCaptureChange: (capturing: boolean) => void };

export default function ShareButton({ canvas, date, disabled, onOpen, onCaptureChange }: Props) {
    const [visible, setVisible] = useState(false);
    const [uri, setUri] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const locked = useRef(false);

    useEffect(() => () => {
        if (uri) releaseCapture(uri);
    }, [uri]);

    const close = () => {
        if (locked.current) return;
        setVisible(false);
        setUri(null);
    };
    const capture = async () => {
        if (locked.current || !canvas.current) return;
        locked.current = true;
        setBusy(true);
        setError(null);
        onOpen();
        try {
            onCaptureChange(true);
            // Let React render and paint the export-only date before taking the snapshot.
            await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
            const result = await captureRef(canvas, {
                format: 'png', result: Platform.OS === 'web' ? 'data-uri' : 'tmpfile',
                fileName: `scrapbook-${date}`, handleGLSurfaceViewOnAndroid: true,
            });
            setUri(result);
        } catch {
            setError('Could not create the image. Please try again once your photos and stickers have loaded.');
        } finally {
            onCaptureChange(false);
            locked.current = false;
            setBusy(false);
            setVisible(true);
        }
    };
    const exportImage = async () => {
        if (!uri || locked.current) return;
        locked.current = true;
        setBusy(true);
        setError(null);
        try {
            await sharePng(uri, `scrapbook-${date}.png`);
        } catch (cause) {
            const message = cause instanceof Error ? cause.message : 'Could not export the image. Please try again.';
            // Dismissing the system share sheet is not an export failure.
            if (!/cancel|abort/i.test(message)) setError(message);
        } finally {
            locked.current = false;
            setBusy(false);
        }
    };

    return <>
        <Pressable accessibilityRole="button" accessibilityLabel="Share scrapbook as PNG" disabled={disabled || busy}
            style={[styles.button, (disabled || busy) && styles.disabled]} onPress={capture}>
            {busy ? <ActivityIndicator color="#fff" /> : <Ionicons name="share-outline" size={28} color="#fff" />}
        </Pressable>
        <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
            <View style={styles.overlay}>
                <View style={styles.panel} accessibilityViewIsModal>
                    <Text style={styles.title}>Share your scrapbook</Text>
                    {uri && <Image source={{ uri }} style={styles.preview} contentFit="contain" accessibilityLabel="PNG preview" />}
                    <Text style={styles.caption}>Captured as a still images. Audio is not included.</Text>
                    {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
                    <View style={styles.actions}>
                        <Pressable accessibilityRole="button" disabled={busy || !uri} onPress={exportImage} style={({ pressed }) => [styles.action, styles.shareAction, pressed && styles.pressed, (busy || !uri) && styles.disabled]}><Text style={styles.shareLabel}>Share</Text></Pressable>
                        <Pressable accessibilityRole="button" disabled={busy} onPress={close} style={({ pressed }) => [styles.action, pressed && styles.pressed, busy && styles.disabled]}><Text>Cancel</Text></Pressable>
                    </View>
                    {busy && <ActivityIndicator />}
                </View>
            </View>
        </Modal>
    </>;
}

const styles = StyleSheet.create({
    button: { position: 'absolute', left: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
    disabled: { opacity: 0.4 },
    overlay: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.35)' },
    panel: { backgroundColor: '#fff', borderRadius: 20, padding: 20, gap: 14, maxHeight: '90%' },
    title: { fontSize: 20, fontWeight: '600', textAlign: 'center' },
    preview: { width: '100%', height: 280, flexShrink: 1 },
    caption: { fontSize: 12, color: '#666', textAlign: 'center' },
    error: { color: '#a32929' },
    actions: { flexDirection: 'row', gap: 10 },
    action: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center', backgroundColor: '#DDDDDD' },
    shareAction: { backgroundColor: '#000000' },
    shareLabel: { color: '#FFFFFF' },
    pressed: { opacity: 0.6 },
});
