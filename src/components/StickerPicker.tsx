import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { STICKERS, type Sticker } from './StickerComponent';
import { fetchKlipyStickers, KLIPY_API_KEY } from '../services/klipy';

type Props = {
    visible: boolean;
    onSelect: (sticker: Sticker) => void;
    onClose: () => void;
};

export default function StickerPicker({ visible, onSelect, onClose }: Props) {
    const [input, setInput] = useState('');
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [retry, setRetry] = useState(0);
    const [stickers, setStickers] = useState<Sticker[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasNext, setHasNext] = useState(false);

    useEffect(() => {
        if (!visible || !KLIPY_API_KEY) return;
        const controller = new AbortController();
        let active = true;
        let timedOut = false;
        setLoading(true);
        setError(null);
        const timeout = setTimeout(() => {
            timedOut = true;
            controller.abort();
        }, 15000);

        fetchKlipyStickers(query, page, controller.signal)
            .then((result) => {
                if (!active) return;
                setStickers((current) => {
                    const combined = page === 1 ? result.stickers : [...current, ...result.stickers];
                    return Array.from(new Map(combined.map((sticker) => [sticker.id, sticker])).values());
                });
                setHasNext(result.hasNext);
            })
            .catch(() => {
                if (active) setError(timedOut ? 'Loading took too long. Please try again.' : 'Could not load stickers. Please try again.');
            })
            .finally(() => {
                clearTimeout(timeout);
                if (active) setLoading(false);
            });

        return () => {
            active = false;
            clearTimeout(timeout);
            controller.abort();
        };
    }, [visible, query, page, retry]);

    const search = (value: string) => {
        setQuery(value.trim());
        setPage(1);
        setStickers([]);
        setHasNext(false);
        setRetry((current) => current + 1);
    };

    const renderSticker = (sticker: Sticker, index: number) => (
        <Pressable
            key={sticker.id}
            onPress={() => onSelect(sticker)}
            accessibilityRole="button"
            accessibilityLabel={`Add ${sticker.title || `sticker ${index + 1}`}`}
            style={({ pressed }) => [styles.option, pressed && styles.pressed]}
        >
            <Image source={sticker.source} style={styles.image} contentFit="contain" />
        </Pressable>
    );

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close sticker library" />
                <View style={styles.panel}>
                    <Text style={styles.title}>Choose a sticker</Text>
                    {KLIPY_API_KEY && (
                        <View style={styles.searchRow}>
                            <TextInput
                                value={input}
                                onChangeText={setInput}
                                onSubmitEditing={() => search(input)}
                                placeholder="Search stickers"
                                accessibilityLabel="Search Klipy stickers"
                                returnKeyType="search"
                                style={styles.searchInput}
                            />
                            <Pressable onPress={() => search(input)} accessibilityRole="button" style={styles.action}>
                                <Text>Search</Text>
                            </Pressable>
                        </View>
                    )}
                    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
                        <Text style={styles.sectionTitle}>Emoji stickers</Text>
                        <View style={styles.list}>{STICKERS.map(renderSticker)}</View>
                        <Text style={styles.sectionTitle}>{query ? `Results for “${query}”` : 'Trending on KLIPY'}</Text>
                        {!KLIPY_API_KEY ? (
                            <Text style={styles.message}>Online stickers are not available yet.</Text>
                        ) : (
                            <>
                                {query !== '' && (
                                    <Pressable onPress={() => { setInput(''); search(''); }} accessibilityRole="button" style={styles.action}>
                                        <Text>Show trending</Text>
                                    </Pressable>
                                )}
                                <View style={styles.list}>{stickers.map(renderSticker)}</View>
                                {loading && <ActivityIndicator accessibilityLabel="Loading stickers" />}
                                {error && (
                                    <View>
                                        <Text style={styles.message} accessibilityRole="alert">{error}</Text>
                                        <Pressable onPress={() => setRetry((current) => current + 1)} accessibilityRole="button" style={styles.action}>
                                            <Text>Try again</Text>
                                        </Pressable>
                                    </View>
                                )}
                                {!loading && !error && stickers.length === 0 && <Text style={styles.message}>No stickers found. Try another search.</Text>}
                                {!loading && !error && hasNext && (
                                    <Pressable onPress={() => setPage((current) => current + 1)} accessibilityRole="button" style={styles.action}>
                                        <Text>Load more</Text>
                                    </Pressable>
                                )}
                            </>
                        )}
                    </ScrollView>
                    <Text style={styles.attribution}>Powered by KLIPY</Text>
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
    panel: { padding: 20, borderRadius: 20, backgroundColor: '#fff', maxHeight: '85%' },
    title: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
    list: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
    content: { gap: 12 },
    sectionTitle: { fontWeight: '600', marginTop: 8 },
    searchRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    searchInput: { flex: 1, minWidth: 0, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10 },
    action: { padding: 10, borderRadius: 10, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
    message: { color: '#666', textAlign: 'center', paddingVertical: 12 },
    attribution: { color: '#666', fontSize: 12, textAlign: 'center', marginTop: 12 },
    option: { padding: 8, borderRadius: 12, backgroundColor: '#f3f3f3' },
    pressed: { opacity: 0.6 },
    image: { width: 64, height: 64 },
    cancel: { alignItems: 'center', padding: 12, marginTop: 20, borderRadius: 10, backgroundColor: '#ddd' },
});
