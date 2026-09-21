import { StyleSheet, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';

type Props = {
    text: string;
};

export default function DraggableText({ text }: Props) {
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
    const drag = Gesture.Pan().onChange((event) => {
        translateX.value += event.changeX;
        translateY.value += event.changeY;
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
            <Animated.View style={[styles.container, animatedStyle]}>
                <Text style={styles.text}>{text}</Text>
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 100,
        left: 100,
        padding: 24,
        minWidth: 120,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(226, 239, 205, 0.4)',
        borderRadius: 20,
    },

    text: {
        fontSize: 20,
    },
});