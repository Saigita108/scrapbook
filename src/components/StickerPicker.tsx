import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { STICKERS, type Sticker } from './StickerComponent';

type Props = {
    visible: boolean;
    onSelect: (sticker: Sticker) => void;
    onClose: () => void;
};

export default function StickerPicker({ visible, onSelect, onClose }: Props) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close sticker library" />
                <View style={styles.panel}>
                    <Text style={styles.title}>Choose a sticker</Text>
                    <View style={styles.list}>
                        {STICKERS.map((sticker, index) => (
                            <Pressable
                                key={sticker.id}
                                onPress={() => onSelect(sticker)}
                                accessibilityRole="button"
                                accessibilityLabel={`Add sticker ${index + 1}`}
                                style={({ pressed }) => [styles.option, pressed && styles.pressed]}
                            >
                                <Image source={sticker.source} style={styles.image} contentFit="contain" />
                            </Pressable>
                        ))}
                    </View>
                    <Pressable style={styles.cancel} onPress={onClose} accessibilityRole="button">
                        <Text>Cancel</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0, 0, 0, 0.35)' },
    panel: { padding: 20, borderRadius: 20, backgroundColor: '#fff' },
    title: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
    list: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
    option: { padding: 8, borderRadius: 12, backgroundColor: '#f3f3f3' },
    pressed: { opacity: 0.6 },
    image: { width: 64, height: 64 },
    cancel: { alignItems: 'center', padding: 12, marginTop: 20, borderRadius: 10, backgroundColor: '#ddd' },
});
