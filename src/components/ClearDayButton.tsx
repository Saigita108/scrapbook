import { useState } from 'react';
import { Keyboard, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

type ClearDayButtonProps = {
    onClearDay: () => void;
    onOpen: () => void;
};

export default function ClearDayButton({ onClearDay, onOpen }: ClearDayButtonProps) {
    const [confirmClear, setConfirmClear] = useState(false);

    return (
        <>
            <Pressable
                style={({ pressed }) => [styles.button, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Clear this day"
                onPress={() => {
                    Keyboard.dismiss();
                    onOpen();
                    setConfirmClear(true);
                }}
            >
                <Ionicons name="refresh" size={28} color="white" />
            </Pressable>

            <Modal
                visible={confirmClear}
                transparent
                animationType="fade"
                onRequestClose={() => setConfirmClear(false)}
            >
                <View style={styles.overlay}>
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        accessibilityRole="button"
                        accessibilityLabel="Cancel clearing this day"
                        onPress={() => setConfirmClear(false)}
                    />
                    <View style={styles.panel} accessibilityViewIsModal>
                        <Text style={styles.title}>Do you want to clear your page?</Text>
                        <View style={styles.actions}>
                            <Pressable
                                style={({ pressed }) => [styles.action, styles.noButton, pressed && styles.pressed]}
                                accessibilityRole="button"
                                onPress={() => setConfirmClear(false)}
                            >
                                <Text>No</Text>
                            </Pressable>
                            <Pressable
                                style={({ pressed }) => [styles.action, styles.yesButton, pressed && styles.pressed]}
                                accessibilityRole="button"
                                onPress={() => {
                                    onClearDay();
                                    setConfirmClear(false);
                                }}
                            >
                                <Text style={styles.yesText}>Yes</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    button: {
        zIndex: 10,
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pressed: { opacity: 0.6 },
    overlay: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0, 0, 0, 0.35)' },
    panel: { padding: 20, borderRadius: 20, backgroundColor: '#FFFFFF' },
    title: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
    actions: { flexDirection: 'row', gap: 10 },
    action: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
    noButton: { backgroundColor: '#DDDDDD' },
    yesButton: { backgroundColor: '#000000' },
    yesText: { color: '#FFFFFF' },
});
