import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

type AddContentButtonProps = {
    onAddText: () => void;
    onAddImage: () => void;
    onAddSticker: () => void;
    onAddGif: () => void;
    onAddAudio: () => void;
    onAddVideo: () => void;
    onAddSteps: () => void;
    menuOpen: boolean;
    onMenuOpenChange: (open: boolean) => void;
};

export default function AddContentButton({ onAddText, onAddImage, onAddSticker, onAddGif, onAddAudio, onAddVideo, onAddSteps, menuOpen, onMenuOpenChange }: AddContentButtonProps) {
    const handleMenuPress = (label: string) => {
        if (label === 'Steps') onAddSteps();
        if (label === 'Text') {
            onAddText();
        }
        if (label === 'Image') {
            onAddImage();
        }
        if (label === 'Sticker') {
            onAddSticker();
        }
        if (label === 'Audio') {
            onAddAudio();
        }
        if (label === 'Video') {
            onAddVideo();
        }
        if (label === 'GIFs') {
            onAddGif();
        }
        onMenuOpenChange(false);
    };

    const menuItems = [
        { label: 'Image', icon: 'image-outline' },
        { label: 'Text', icon: 'text-outline' },
        { label: 'Sticker', icon: 'happy-outline' },
        { label: 'GIFs', icon: 'film-outline' },
        { label: 'Audio', icon: 'mic-outline' },
        { label: 'Video', icon: 'videocam-outline' },
        { label: 'Steps', icon: 'footsteps-outline' },
    ] as const;

    return (
        <View style={styles.wrapper}>

            {menuOpen && (
                <View style={styles.menu}>
                    {menuItems.map((item) => (
                        <Pressable
                            key={item.label}
                            style={styles.menuItem}
                            onPress={() => handleMenuPress(item.label)}
                        >
                            <Ionicons
                                name={item.icon}
                                size={22}
                                color="#000"
                            />

                            <Text style={styles.menuText}>
                                {item.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            )}

            <Pressable
                style={styles.addButton}
                onPress={() => onMenuOpenChange(!menuOpen)}
            >
                <Ionicons
                    name={menuOpen ? 'close' : 'add'}
                    size={32}
                    color="white"
                />
            </Pressable>



        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        zIndex: 10,
        position: 'absolute',
        right: 20,
        bottom: 86,
        alignItems: 'flex-end',
    },

    addButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },

    menu: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 8,
        marginBottom: 10,
        minWidth: 150,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },

    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
    },

    menuText: {
        fontSize: 16,
    },
});
