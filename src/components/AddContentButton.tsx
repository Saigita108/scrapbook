import Ionicons from '@expo/vector-icons/Ionicons';
import { GlassView } from 'expo-glass-effect';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
                                color="#4a432fc3"
                            />

                            <Text style={styles.menuText}>
                                {item.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            )}

            <GlassView style={styles.addButton} glassEffectStyle="regular" tintColor="rgba(255, 255, 255, 0.2)" isInteractive>
                <Pressable
                    style={styles.buttonContent}
                    accessibilityRole="button"
                    accessibilityLabel={menuOpen ? 'Close add content menu' : 'Add content'}
                    onPress={() => onMenuOpenChange(!menuOpen)}
                >
                    <Ionicons
                        name={menuOpen ? 'close' : 'add'}
                        size={32}
                        color='#201e1869'
                    />
                </Pressable>
            </GlassView>



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
        backgroundColor: '#201e1837',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#201e1869',
    },

    buttonContent: {
        color: '#a89e8062',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    menu: {
        backgroundColor: '#ebe8e0',
        borderRadius: 16,
        padding: 8,
        marginBottom: 10,
        minWidth: 150,

        shadowColor: '#1f1f1f',
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
        color: "#4a432fc3"
    },
});
