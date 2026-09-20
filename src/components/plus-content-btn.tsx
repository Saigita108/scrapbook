import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AddContentButton() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <View style={styles.wrapper}>

            {menuOpen && (
                <View style={styles.menu}>
                    <Pressable style={styles.menuItem}>
                        <Ionicons name="image-outline" size={22} color="#000" />
                        <Text style={styles.menuText}>Image</Text>
                    </Pressable>

                    <Pressable style={styles.menuItem}>
                        <Ionicons name="text-outline" size={22} color="#000" />
                        <Text style={styles.menuText}>Text</Text>
                    </Pressable>

                    <Pressable style={styles.menuItem}>
                        <Ionicons name="happy-outline" size={22} color="#000" />
                        <Text style={styles.menuText}>Sticker</Text>
                    </Pressable>

                    <Pressable style={styles.menuItem}>
                        <Ionicons name="mic-outline" size={22} color="#000" />
                        <Text style={styles.menuText}>Audio</Text>
                    </Pressable>

                    <Pressable style={styles.menuItem}>
                        <Ionicons name="videocam-outline" size={22} color="#000" />
                        <Text style={styles.menuText}>Video</Text>
                    </Pressable>
                </View>
            )}

            <Pressable
                style={styles.addButton}
                onPress={() => setMenuOpen(!menuOpen)}
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
        position: 'absolute',
        right: 20,
        bottom: 20,
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