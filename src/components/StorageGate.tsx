import useRefreshSteps from '@/hooks/useRefreshSteps';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useScrapbook, useStorageStatus } from '@/stores/scrapbook';

export default function StorageGate({ children }: { children: ReactNode }) {
    const [ready, setReady] = useState(useScrapbook.persist.hasHydrated());
    useRefreshSteps(ready);
    const error = useStorageStatus((state) => state.error);
    const load = () => {
        useStorageStatus.setState({ error: null });
        void useScrapbook.persist.rehydrate();
    };
    useEffect(() => {
        const unsubscribe = useScrapbook.persist.onFinishHydration(() => setReady(true));
        if (!useScrapbook.persist.hasHydrated()) load();
        else setReady(true);
        return unsubscribe;
    }, []);
    return (
        <View style={{ flex: 1 }}>
            {error && <View style={{ padding: 20, backgroundColor: '#fff0df' }}>
                <Text accessibilityRole="alert">{error}</Text>
                <Pressable accessibilityRole="button" onPress={ready ? () => useScrapbook.setState({ days: useScrapbook.getState().days }) : load}>
                    <Text style={{ paddingTop: 12 }}>Try again</Text>
                </Pressable>
            </View>}
            {ready ? children : !error && <ActivityIndicator style={{ flex: 1 }} accessibilityLabel="Loading scrapbook" />}
        </View>
    );
}
