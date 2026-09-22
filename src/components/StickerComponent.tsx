import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import GestureItem, { type GestureItemProps } from './GestureItem';

export const STICKERS = [
    { id: 'emoji1', source: require('../../assets/stickers/emoji1.png') },
    { id: 'emoji2', source: require('../../assets/stickers/emoji2.png') },
    { id: 'emoji3', source: require('../../assets/stickers/emoji3.png') },
    { id: 'emoji4', source: require('../../assets/stickers/emoji4.png') },
    { id: 'emoji5', source: require('../../assets/stickers/emoji5.png') },
] as const;

export type Sticker = (typeof STICKERS)[number];
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
