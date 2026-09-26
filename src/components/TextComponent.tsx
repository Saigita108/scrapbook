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
        padding: 20,
        minWidth: 120,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#a89e8062',
        borderRadius: 20,
    },
    text: { fontFamily: 'IndieFlower', fontSize: 24, color: '#e8e5dd'},
});
