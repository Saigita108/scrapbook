import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View, Pressable, Platform, KeyboardAvoidingView } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import Plusbtn from '@/components/AddContentButton';
import GesturesText from '@/components/TextComponent';
import GestureItem from '@/components/GestureItem';
import TrashBin, { useTrashTarget } from '@/components/TrashBin';
import Ionicons from '@expo/vector-icons/Ionicons';

type ScrapbookText = {
    id: string;
    text: string;
};

type ScrapbookImage = {
    id: string;
    uri: string;
};

export default function TodayScreen() {
    const [isAddingText, setIsAddingText] = useState(false);
    const [isAddingImage, setIsAddingImage] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [textElements, setTextElements] = useState<ScrapbookText[]>([]);
    const [imageElements, setImageElements] = useState<ScrapbookImage[]>([]);
    const trash = useTrashTarget();

    const deleteText = (id: string) => {
        setTextElements((current) => current.filter((element) => element.id !== id));
    };

    const deleteImage = (id: string) => {
        setImageElements((current) => current.filter((element) => element.id !== id));
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
            });

            if (result.canceled) return;

            const asset = result.assets[0];
            if (!asset) return;

            const newImage: ScrapbookImage = {
                id: Date.now().toString(),
                uri: asset.uri,
            };
            setImageElements((current) => [...current, newImage]);
            setIsAddingImage(false);
        } catch (error) {
            console.error('Failed to pick an image:', error);
            Alert.alert('Could not open photo library', 'Please try again.');
        }
    };

    const handleAddText = () => {
        console.log('Add text!');
        setIsAddingText(true);
    };
    const handleAddImage = () => {
        setIsAddingImage(true);
    };
    const handleSubmitText = () => {
        if (!textInput.trim()) return;

        const newTextElement: ScrapbookText = {
            id: Date.now().toString(),
            text: textInput.trim(),
        };

        setTextElements((currentElements) => [
            ...currentElements,
            newTextElement,
        ]);

        setTextInput('');
        setIsAddingText(false);
    };
    

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View
                style={styles.container}
                onLayout={trash.onCanvasLayout}
            >
                {imageElements.map((element, index) => (
                    <GestureItem
                        key={element.id}
                        id={`image:${element.id}`}
                        trash={trash}
                        onDelete={() => deleteImage(element.id)}
                        style={{ left: 20, top: 40 + index * 24 }}
                    >
                        <Image
                            source={{ uri: element.uri }}
                            style={styles.scrapbookImage}
                            contentFit="contain"
                        />
                    </GestureItem>
                ))}
                {textElements.map((element) => (
                    <GesturesText
                        key={element.id}
                        id={`text:${element.id}`}
                        text={element.text}
                        trash={trash}
                        onDelete={() => deleteText(element.id)}
                    />
                ))}
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
                            <Pressable style={styles.doneButton} onPress={handleSubmitText}>
                                <Text style={styles.doneButtonText}>Add</Text>
                            </Pressable>
                            <Pressable style={styles.cancelButton} onPress={() => {
                                setTextInput('');
                                setIsAddingText(false);
                            }}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                )}
                {isAddingImage && (
                    <View style={styles.imagePickerContainer}>
                        <Text style={styles.imagePickerTitle}>
                            Add a photo
                        </Text>

                        <Pressable style={styles.imageOption}>
                            <Ionicons name="camera-outline" size={24} color="#000" />
                            <Text>Camera</Text>
                        </Pressable>

                        <Pressable
                            style={styles.imageOption}
                            onPress={pickImage}
                        >
                            <Ionicons name="images-outline" size={24} color="#000" />
                            <Text>Gallery</Text>
                        </Pressable>

                        <Pressable
                            style={styles.cancelButton}
                            onPress={() => setIsAddingImage(false)}
                        >
                            <Text>Cancel</Text>
                        </Pressable>
                    </View>
                )}
                <Plusbtn onAddText={handleAddText} onAddImage={handleAddImage} />
                <TrashBin target={trash} />
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

    scrapbookImage: {
        width: 200,
        height: 200,
    },

    scrapbookText: {
        position: 'absolute',
        top: 100,
        left: 100,
        fontSize: 20,
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

    imagePickerContainer: {
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: 90,
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        zIndex: 10,
    },

    imagePickerTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },

    imageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 12,
    },
});
