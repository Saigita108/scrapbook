import { StyleSheet, Text } from 'react-native';
import GestureItem, { type GestureItemProps } from './GestureItem';

type Props = Omit<GestureItemProps, 'children' | 'style'> & { text: string };

export default function StepTextComponent({ text, ...gestureProps }: Props) {
    return (
        <GestureItem {...gestureProps} style={styles.container}>
            <Text style={styles.text}>{text}</Text>
        </GestureItem>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        minWidth: 120,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(164, 217, 218, 0.7)',
        borderRadius: 14,
    },
    text: {
        fontFamily: 'Unbounded',
        fontSize: 20,
        fontWeight: '700',
        color: '#f7f5f0',
    },
});