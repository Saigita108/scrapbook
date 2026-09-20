import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AddContentButton() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <Pressable style={styles.addButton} onPress={() => setMenuOpen(!menuOpen)}>
            <Ionicons name={menuOpen ? 'close' : 'add'} size={32} color="white" />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    addButton: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
});