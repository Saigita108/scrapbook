import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import GestureItem, { type GestureItemProps } from './GestureItem';

type Props = Omit<GestureItemProps, 'children' | 'style'> & {
    uri: string;
    index: number;
};

export default function ImageComponent({ uri, index, ...gestureProps }: Props) {
    return (
        <GestureItem {...gestureProps} style={{ left: 20, top: 40 + index * 24 }}>
            <Image source={{ uri }} style={styles.image} contentFit="contain" />
        </GestureItem>
    );
}

const styles = StyleSheet.create({
    image: {
        width: 200,
        height: 200,
    },
});
