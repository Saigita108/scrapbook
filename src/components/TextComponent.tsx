import { StyleSheet, Text } from 'react-native';
import GestureItem, { type GestureItemProps } from './GestureItem';

type Props = Omit<GestureItemProps, 'children' | 'style'> & { text: string };

export default function GesturesText({ text, ...gestureProps }: Props) {
    return (
        <GestureItem {...gestureProps} style={styles.container}>
            <Text style={styles.text}>{text}</Text>
        </GestureItem>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        minWidth: 120,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(226, 239, 205, 0.4)',
        borderRadius: 20,
    },
    text: { fontSize: 20 },
});
