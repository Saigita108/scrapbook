import { StyleSheet, type LayoutChangeEvent } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, { type SharedValue, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export const TRASH_RADIUS = 44;
const BOTTOM = 20;

export type TrashTarget = {
    center: SharedValue<{ x: number; y: number } | null>;
    activeId: SharedValue<string | null>;
    isOver: SharedValue<boolean>;
};

// Attach onCanvasLayout to the direct parent of both the items and the bin.
export function useTrashTarget() {
    const center = useSharedValue<{ x: number; y: number } | null>(null);
    const activeId = useSharedValue<string | null>(null);
    const isOver = useSharedValue(false);

    const onCanvasLayout = ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
        center.value = { x: layout.width / 2, y: layout.height - BOTTOM - TRASH_RADIUS };
    };

    return { center, activeId, isOver, onCanvasLayout };
}

export default function TrashBin({ target }: { target: TrashTarget }) {
    const animatedStyle = useAnimatedStyle(() => ({
        opacity: withTiming(target.activeId.value === null ? 0 : 1, { duration: 120 }),
        backgroundColor: withTiming(target.isOver.value ? '#dc2626' : '#252525'),
        transform: [{ scale: withTiming(target.isOver.value ? 1 : 0.7, { duration: 150 }) }],
    }));

    return (
        <Animated.View pointerEvents="none" accessible={false} style={[styles.bin, animatedStyle]}>
            <Ionicons name="trash-outline" size={30} color="#fff" />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    bin: {
        position: 'absolute',
        bottom: BOTTOM,
        left: '50%',
        marginLeft: -TRASH_RADIUS,
        width: TRASH_RADIUS * 2,
        height: TRASH_RADIUS * 2,
        borderRadius: TRASH_RADIUS,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
    },
});
