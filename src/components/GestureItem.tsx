import type { Transform } from '@/stores/scrapbook';
import { type ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { TRASH_RADIUS, type TrashTarget } from './TrashBin';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { overlapsTrash } from '@/utils/overlapsTrash';

export type GestureItemProps = {
    layer?: number;
    transform?: Transform;
    onTransform: (value: Transform) => void;
    children: ReactNode;
    id: string;
    trash: TrashTarget;
    onDelete: (id: string) => void;
    style?: StyleProp<ViewStyle>;
    onTap?: () => void;
};

export default function GestureItem({ children, id, trash, onDelete, style, onTap, transform, onTransform, layer = 2 }: GestureItemProps) {
    const layoutCenter = useSharedValue({ x: 0, y: 0 });
    const layoutSize = useSharedValue({ width: 0, height: 0 });
    // Position
    const translateX = useSharedValue(transform?.x ?? 0);
    const translateY = useSharedValue(transform?.y ?? 0);

    // Scale
    const scale = useSharedValue(transform?.scale ?? 1);
    const savedScale = useSharedValue(transform?.scale ?? 1);

    // Rotation
    const rotation = useSharedValue(transform?.rotation ?? 0);
    const savedRotation = useSharedValue(transform?.rotation ?? 0);

    const commit = () => {
        'worklet';
        scheduleOnRN(onTransform, { x: translateX.value, y: translateY.value, scale: scale.value, rotation: rotation.value });
    };

    // DRAG
    const isOverTrash = () => {
        'worklet';
        const target = trash.center.value;
        if (!target || layoutSize.value.width === 0 || layoutSize.value.height === 0) return false;
        return overlapsTrash(
            layoutCenter.value.x + translateX.value,
            layoutCenter.value.y + translateY.value,
            layoutSize.value.width,
            layoutSize.value.height,
            scale.value,
            rotation.value,
            target.x,
            target.y,
            TRASH_RADIUS,
        );
    };

    useAnimatedReaction(isOverTrash, (isOver) => {
        if (trash.activeId.value === id) trash.isOver.value = isOver;
    });

    const drag = Gesture.Pan()
        .minDistance(onTap ? 10 : 0)
        .averageTouches(true)
        .onBegin(() => {
            trash.activeId.value = id;
            trash.isOver.value = isOverTrash();
        })
        .onChange((event) => {
            translateX.value += event.changeX;
            translateY.value += event.changeY;
        })
        .onEnd((_event, success) => {
            if (success && trash.activeId.value === id && isOverTrash()) {
                scheduleOnRN(onDelete, id);
            }
        })
        .onFinalize(() => {
            commit();
            if (trash.activeId.value === id) {
                trash.activeId.value = null;
                trash.isOver.value = false;
            }
        });

    // PINCH
    const pinch = Gesture.Pinch()
        .onUpdate((event) => {
            scale.value = savedScale.value * event.scale;
        })
        .onFinalize(() => {
            savedScale.value = scale.value;
            commit();
        });

    // ROTATE
    const rotate = Gesture.Rotation()
        .onUpdate((event) => {
            rotation.value = savedRotation.value + event.rotation;
        })
        .onFinalize(() => {
            savedRotation.value = rotation.value;
            commit();
        });

    // Allow all three gestures
    const combinedGesture = Gesture.Simultaneous(
        drag,
        pinch,
        rotate
    );
    const tap = Gesture.Tap().maxDistance(10).onEnd((_event, success) => {
        if (success && onTap) scheduleOnRN(onTap);
    });

    // Apply transformations
    const animatedStyle = useAnimatedStyle(() => {
        return {
            // Raise the active item only within its content layer.
            zIndex: layer + (trash.activeId.value === id ? 1 : 0),
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value },
                { rotateZ: `${rotation.value}rad` },
            ],
        };
    });

    return (
        <GestureDetector gesture={onTap ? Gesture.Exclusive(combinedGesture, tap) : combinedGesture}>
            <Animated.View
                onLayout={({ nativeEvent: { layout } }) => {
                    layoutSize.value = { width: layout.width, height: layout.height };
                    layoutCenter.value = {
                        x: layout.x + layout.width / 2,
                        y: layout.y + layout.height / 2,
                    };
                }}
                style={[styles.container, style, animatedStyle]}
            >
                {children}
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 100,
        left: 100,
    },
});
