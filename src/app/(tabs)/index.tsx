import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Pressable, Platform, KeyboardAvoidingView } from 'react-native';
import Plusbtn from '@/components/plus-content-btn';

export default function TodayScreen() {
    const [isAddingText, setIsAddingText] = useState(false);
    const [textInput, setTextInput] = useState('');

    const handleAddText = () => {
        console.log('Add text!');
        setIsAddingText(true);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.container}>
                {isAddingText && (
                    <View style={styles.textInputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Write something..."
                            value={textInput}
                            onChangeText={setTextInput}
                            autoFocus
                        />
                        <View style={styles.textInputButtons}>
                            <Pressable style={styles.doneButton}>
                                <Text style={styles.doneButtonText}>Add</Text>
                            </Pressable>
                            <Pressable style={styles.cancelButton}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                )}

                <Plusbtn onAddText={handleAddText} />
            </View>
        </KeyboardAvoidingView>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#99895f',
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },

    textInputContainer: {
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: 120,
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 12,
    },

    textInputButtons: {
        flexDirection: 'row',
        gap: 5,
        marginTop: 8,
    },

    textInput: {
        fontSize: 16,
        padding: 10,
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: 8,
    },

    doneButton: {
        flex: 1,
        padding: 10,
        backgroundColor: '#000000',
        borderRadius: 8,
        alignItems: 'center',
    },

    doneButtonText: {
        color: '#FFFFFF',
    },

    cancelButton: {
        flex: 1,
        padding: 10,
        backgroundColor: '#CCCCCC',
        borderRadius: 8,
        alignItems: 'center',
    },

    cancelButtonText: {
        color: '#000000',
    },
});
