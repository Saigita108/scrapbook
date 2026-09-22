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

export type GestureItemProps = {
    children: ReactNode;
    id: string;
    trash: TrashTarget;
    onDelete: (id: string) => void;
    style?: StyleProp<ViewStyle>;
};

export default function GestureItem({ children, id, trash, onDelete, style }: GestureItemProps) {
    const layoutCenter = useSharedValue({ x: 0, y: 0 });
    // Position
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    // Scale
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);

    // Rotation
    const rotation = useSharedValue(0);
    const savedRotation = useSharedValue(0);

    // DRAG
    const isOverTrash = () => {
        'worklet';
        const target = trash.center.value;
        if (!target) return false;
        // Both centers are relative to the scrapbook canvas. Scaling and
        // rotation leave the item's center unchanged.
        const dx = layoutCenter.value.x + translateX.value - target.x;
        const dy = layoutCenter.value.y + translateY.value - target.y;
        return dx * dx + dy * dy <= TRASH_RADIUS * TRASH_RADIUS;
    };

    useAnimatedReaction(isOverTrash, (isOver) => {
        if (trash.activeId.value === id) trash.isOver.value = isOver;
    });

    const drag = Gesture.Pan()
        .minDistance(0)
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
        .onEnd(() => {
            savedScale.value = scale.value;
        });

    // ROTATE
    const rotate = Gesture.Rotation()
        .onUpdate((event) => {
            rotation.value = savedRotation.value + event.rotation;
        })
        .onEnd(() => {
            savedRotation.value = rotation.value;
        });

    // Allow all three gestures
    const combinedGesture = Gesture.Simultaneous(
        drag,
        pinch,
        rotate
    );

    // Apply transformations
    const animatedStyle = useAnimatedStyle(() => {
        return {
            zIndex: trash.activeId.value === id ? 1 : 0,
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value },
                { rotateZ: `${rotation.value}rad` },
            ],
        };
    });

    return (
        <GestureDetector gesture={combinedGesture}>
            <Animated.View
                onLayout={({ nativeEvent: { layout } }) => {
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
