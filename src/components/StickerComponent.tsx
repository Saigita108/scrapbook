import { StyleSheet } from 'react-native';
import { Image, type ImageSource } from 'expo-image';
import GestureItem, { type GestureItemProps } from './GestureItem';

export type Sticker = {
    id: string;
    title?: string;
    source: number | ImageSource;
};
type Props = Omit<GestureItemProps, 'children' | 'style'> & { sticker: Sticker };

export default function StickerComponent({ sticker, ...gestureProps }: Props) {
    return (
        <GestureItem {...gestureProps}>
            <Image source={sticker.source} style={styles.sticker} contentFit="contain" />
        </GestureItem>
    );
}

const styles = StyleSheet.create({
    sticker: { width: 100, height: 100 },
});
