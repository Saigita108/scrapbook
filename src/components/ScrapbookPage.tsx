import Plusbtn from '@/components/AddContentButton';
import AudioComponent from '@/components/AudioComponent';
import AudioRecorder, { type AudioClip } from '@/components/AudioRecorder';
import ClearDayButton from '@/components/ClearDayButton';
import ImageComponent from '@/components/ImageComponent';
import ShareButton from '@/components/ShareButton';
import StepCounter from '@/components/StepCounter';
import StepTextComponent from '@/components/StepTextComponent';
import StickerComponent, { type Sticker } from '@/components/StickerComponent';
import StickerPicker from '@/components/StickerPicker';
import GesturesText from '@/components/TextComponent';
import TrashBin, { useTrashTarget } from '@/components/TrashBin';
import VideoComponent from '@/components/VideoComponent';
import type { KlipyMediaType } from '@/services/klipy';
import { emptyDay, isDailyStepText, useScrapbook, type Day } from '@/stores/scrapbook';
import { saveMedia } from '@/utils/saveMedia';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AudioModule } from 'expo-audio';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type ScrapbookText = {
    id: string;
    text: string;
};

export default function ScrapbookPage({ date }: { date: string }) {
    const canvas = useRef<View>(null);
    const [isAddingSteps, setIsAddingSteps] = useState(false);
    useFocusEffect(useCallback(() => () => setIsAddingSteps(false), []));
    const [capturing, setCapturing] = useState(false);
    const dateStamp = new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
    const day = useScrapbook((state) => state.days[date] ?? emptyDay);
    const update = useScrapbook((state) => state.update);
    const saveTransform = useScrapbook((state) => state.transform);
    const transformProps = (id: string) => ({
        transform: day.transforms[id],
        onTransform: (value: import('@/stores/scrapbook').Transform) => saveTransform(date, id, value),
    });
    const [contentMenuOpen, setContentMenuOpen] = useState(false);
    const [isAddingText, setIsAddingText] = useState(false);
    const [isAddingImage, setIsAddingImage] = useState(false);
    const [textInput, setTextInput] = useState('');
    const textElements = day.textElements;
    const setTextElements = (action: Day['textElements'] | ((current: Day['textElements']) => Day['textElements'])) => update(date, 'textElements', action);
    const imageElements = day.imageElements;
    const setImageElements = (action: Day['imageElements'] | ((current: Day['imageElements']) => Day['imageElements'])) => update(date, 'imageElements', action);
    const [mediaType, setMediaType] = useState<KlipyMediaType>('stickers');
    const [isAddingSticker, setIsAddingSticker] = useState(false);
    const stickerElements = day.stickerElements;
    const setStickerElements = (action: Day['stickerElements'] | ((current: Day['stickerElements']) => Day['stickerElements'])) => update(date, 'stickerElements', action);
    const trash = useTrashTarget();
    const [isAddingAudio, setIsAddingAudio] = useState(false);
    const audioElements = day.audioElements;
    const setAudioElements = (action: Day['audioElements'] | ((current: Day['audioElements']) => Day['audioElements'])) => update(date, 'audioElements', action);

    const videoElements = day.videoElements;
    const setVideoElements = (action: Day['videoElements'] | ((current: Day['videoElements']) => Day['videoElements'])) => update(date, 'videoElements', action);
    const [isRecordingVideo, setIsRecordingVideo] = useState(false);
    const videoCaptureActive = useRef(false);
    const dayRevision = useRef(0);

    useEffect(() => () => { dayRevision.current += 1; }, []);

    const handleAddVideo = async () => {
        if (videoCaptureActive.current) return;
        if (Platform.OS === 'web') {
            Alert.alert('Record on your phone', 'Open Scrapbook on iOS or Android to film a video with sound.');
            return;
        }
        videoCaptureActive.current = true;
        const revision = dayRevision.current;
        Keyboard.dismiss();
        setIsAddingText(false);
        setIsAddingImage(false);
        setIsAddingSticker(false);
        setIsAddingAudio(false);
        setIsRecordingVideo(true);
        try {
            const camera = await ImagePicker.requestCameraPermissionsAsync();
            if (!camera.granted) {
                Alert.alert('Camera access needed', camera.canAskAgain
                    ? 'Allow camera access to film a video.'
                    : 'Enable camera access for Scrapbook in your device settings.');
                return;
            }
            const microphone = await AudioModule.requestRecordingPermissionsAsync();
            if (!microphone.granted) {
                Alert.alert('Microphone access needed', microphone.canAskAgain
                    ? 'Allow microphone access to record your video with sound.'
                    : 'Enable microphone access for Scrapbook in your device settings.');
                return;
            }
            if (revision !== dayRevision.current) return;
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['videos'],
                allowsEditing: false,
            });
            if (result.canceled || revision !== dayRevision.current) return;
            const asset = result.assets[0];
            if (asset) {
                const uri = await saveMedia(asset.uri);
                if (revision !== dayRevision.current) return;
                const id = Date.now().toString();
                setVideoElements((current) => [...current, { id, uri }]);
                trash.topId.value = `video:${id}`;
            }
        } catch {
            Alert.alert('Could not record video', 'Please try again on a device with a camera.');
        } finally {
            videoCaptureActive.current = false;
            setIsRecordingVideo(false);
        }
    };

    const clearDay = () => {
        dayRevision.current += 1;
        useScrapbook.getState().clear(date);
        setIsAddingSteps(false);

        Keyboard.dismiss();
        setTextInput('');
        setIsAddingText(false);
        setIsAddingImage(false);
        setIsAddingSticker(false);
        setIsAddingAudio(false);
    };

    const handleAddAudio = () => {
        Keyboard.dismiss();
        setIsAddingText(false);
        setIsAddingImage(false);
        setIsAddingSticker(false);
        setIsAddingAudio(true);
    };

    const saveAudio = async (clip: AudioClip) => {
        const revision = dayRevision.current;
        const uri = await saveMedia(clip.uri);
        if (revision !== dayRevision.current) return;
        const element = { ...clip, uri, id: Date.now().toString() };
        setAudioElements((current) => [...current, element]);
        trash.topId.value = `audio:${element.id}`;
        setIsAddingAudio(false);
    };

    const deleteAudio = (id: string) => {
        setAudioElements((current) => current.filter((element) => element.id !== id));
    };

    const addSticker = (sticker: Sticker) => {
        const newSticker = { id: Date.now().toString(), sticker };
        setStickerElements((current) => [...current, newSticker]);
        trash.topId.value = `sticker:${newSticker.id}`;
        setIsAddingSticker(false);
    };

    const deleteSticker = (id: string) => {
        setStickerElements((current) => current.filter((element) => element.id !== id));
    };

    const handleAddSticker = (type: KlipyMediaType = 'stickers') => {
        setMediaType(type);
        Keyboard.dismiss();
        setIsAddingText(false);
        setIsAddingImage(false);
        setIsAddingSticker(true);
    };

    const deleteText = (id: string) => {
        setTextElements((current) => current.filter((element) => element.id !== id));
    };

    const deleteImage = (id: string) => {
        setImageElements((current) => current.filter((element) => element.id !== id));
    };

    const addPickedImage = async (result: ImagePicker.ImagePickerResult, revision: number) => {
        if (result.canceled) return;
        const asset = result.assets[0];
        if (!asset) return;

        const uri = await saveMedia(asset.uri);
        if (revision !== dayRevision.current) return;
        const newImage = {
            id: Date.now().toString(),
            uri,
            index: Math.max(-1, ...(useScrapbook.getState().days[date]?.imageElements.map((image) => image.index) ?? [])) + 1,
        };
        setImageElements((current) => [...current, newImage]);
        trash.topId.value = `image:${newImage.id}`;
        setIsAddingImage(false);
    };

    const takePhoto = async () => {
        const revision = dayRevision.current;
        try {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
                Alert.alert(
                    'Camera access needed',
                    permission.canAskAgain
                        ? 'Allow camera access to take a photo for your scrapbook.'
                        : 'Enable camera access for Scrapbook in your device settings.',
                );
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 1,
            });
            await addPickedImage(result, revision);
        } catch (error) {
            console.error('Failed to take a photo:', error);
            Alert.alert('Could not open camera', 'Try again on a device with a camera.');
        }
    };

    const pickImage = async () => {
        const revision = dayRevision.current;
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
            });

            await addPickedImage(result, revision);
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

        const id = Date.now().toString();
        const newTextElement: ScrapbookText = {
            id,
            text: textInput.trim(),
        };

        setTextElements((currentElements) => [
            ...currentElements,
            newTextElement,
        ]);
        trash.topId.value = `text:${id}`;

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
                <View ref={canvas} collapsable={false} style={styles.canvas}>
                    <Image
                        source={require('../../assets/images/paper-texture.jpeg')}
                        style={[StyleSheet.absoluteFill, styles.paperTexture]}
                    />
                    {imageElements.map((element) => (
                        <ImageComponent
                            key={element.id}
                            id={`image:${element.id}`}
                            {...transformProps(`image:${element.id}`)}
                            uri={element.uri}
                            index={element.index}
                            trash={trash}
                            onDelete={() => deleteImage(element.id)}
                        />
                    ))}
                    {textElements.map((element) => (
                        element.stepSource || isDailyStepText(element, date)
                            ? <StepTextComponent
                                key={element.id}
                                id={`text:${element.id}`}
                                {...transformProps(`text:${element.id}`)}
                                layer={4}
                                text={element.text}
                                trash={trash}
                                onDelete={() => deleteText(element.id)}
                            />
                            : <GesturesText
                                key={element.id}
                                id={`text:${element.id}`}
                                {...transformProps(`text:${element.id}`)}
                                layer={4}
                                text={element.text}
                                trash={trash}
                                onDelete={() => deleteText(element.id)}
                            />
                    ))}
                    {stickerElements.map((element) => (
                        <StickerComponent
                            key={element.id}
                            id={`sticker:${element.id}`}
                            {...transformProps(`sticker:${element.id}`)}
                            layer={element.sticker.id.startsWith('klipy-gifs-') ? 0 : 6}
                            sticker={element.sticker}
                            trash={trash}
                            onDelete={() => deleteSticker(element.id)}
                        />
                    ))}
                    {audioElements.map((element) => (
                        <AudioComponent
                            key={element.id}
                            id={`audio:${element.id}`}
                            {...transformProps(`audio:${element.id}`)}
                            clip={element}
                            recording={isAddingAudio || isRecordingVideo}
                            trash={trash}
                            onDelete={() => deleteAudio(element.id)}
                        />
                    ))}
                    {videoElements.map((element) => (
                        <VideoComponent
                            key={element.id}
                            id={`video:${element.id}`}
                            {...transformProps(`video:${element.id}`)}
                            uri={element.uri}
                            recording={isAddingAudio || isRecordingVideo}
                            trash={trash}
                            onDelete={() => setVideoElements((current) => current.filter((video) => video.id !== element.id))}
                        />
                    ))}
                    <Text pointerEvents="none" style={[styles.dateStamp, { opacity: capturing ? 1 : 0 }]}>
                        {dateStamp}
                    </Text>
                </View>
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

                        <Pressable style={styles.imageOption} onPress={takePhoto}>
                            <Ionicons name="camera-outline" size={24} color="#201e18db" />
                            <Text>Camera</Text>
                        </Pressable>

                        <Pressable
                            style={styles.imageOption}
                            onPress={pickImage}
                        >
                            <Ionicons name="images-outline" size={24} color="#201e18db" />
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
                <StickerPicker
                    key={mediaType}
                    mediaType={mediaType}
                    visible={isAddingSticker}
                    onSelect={addSticker}
                    onClose={() => setIsAddingSticker(false)}
                />
                {isAddingAudio && <AudioRecorder onSave={saveAudio} onCancel={() => setIsAddingAudio(false)} />}
                {isAddingSteps && <StepCounter date={date} onClose={() => setIsAddingSteps(false)} onAdd={(text, stepSource) => {
                    const id = `${Date.now()}-steps`;
                    setTextElements((current) => [...current, { id, text, stepSource }]);
                    trash.topId.value = `text:${id}`;
                    setIsAddingSteps(false);
                }} />}
                {!isAddingText && <Plusbtn onAddSteps={() => {
                    Keyboard.dismiss();
                    setIsAddingText(false);
                    setIsAddingImage(false);
                    setIsAddingSticker(false);
                    setIsAddingAudio(false);
                    setIsAddingSteps(true);
                }} onAddText={handleAddText} onAddImage={handleAddImage} onAddSticker={() => handleAddSticker()} onAddGif={() => handleAddSticker('gifs')} onAddAudio={handleAddAudio} onAddVideo={handleAddVideo} menuOpen={contentMenuOpen} onMenuOpenChange={setContentMenuOpen} />}
                <ClearDayButton onClearDay={clearDay} onOpen={() => setContentMenuOpen(false)} />
                <ShareButton canvas={canvas} date={date} onCaptureChange={setCapturing}
                    disabled={isAddingSteps || isAddingText || isAddingImage || isAddingSticker || isAddingAudio || isRecordingVideo}
                    onOpen={() => setContentMenuOpen(false)} />
                <TrashBin target={trash} />
            </View>
        </KeyboardAvoidingView>
    );

}

const styles = StyleSheet.create({
    dateStamp: {
        position: 'absolute', bottom: 16, right: 16,
        padding: 12, borderRadius: 8, transform: [{ rotate: '-2deg' }],
        backgroundColor: 'rgba(164, 217, 218, 0.90)', color: '#282725',
        fontFamily: 'DMSans', fontSize: 12, fontWeight: '600',
    },
    canvas: { ...StyleSheet.absoluteFill, overflow: 'hidden' },
    container: {
        flex: 1,
        backgroundColor: '#a89e80',
    },
    paperTexture: {
        opacity: 0.4,
    },

    scrapbookText: {
        position: 'absolute',
        top: 100,
        left: 100,
        fontSize: 20,
    },

    title: {
        fontSize: 30,
        fontWeight: 'bold',
    },

    textInputContainer: {
        zIndex: 10,
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: 120,
        backgroundColor: '#e9e6dc',
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
        borderColor: '#201e18db',
        borderRadius: 8,
    },

    doneButton: {
        flex: 1,
        padding: 10,
        backgroundColor: '#201e18db',
        borderRadius: 8,
        alignItems: 'center',
    },

    doneButtonText: {
        color: '#e9e6dc',
    },

    cancelButton: {
        flex: 1,
        padding: 10,
        backgroundColor: '#201e1859',
        borderRadius: 8,
        alignItems: 'center',
    },

    cancelButtonText: {
        color: '#e9e6dc',
    },

    imagePickerContainer: {
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: 150,
        backgroundColor: '#e9e6dc',
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
