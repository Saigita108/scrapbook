import { StyleSheet, Text, View } from 'react-native';

export default function CalendarScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Calendar</Text>
            <Text>Your scrapbook calendar will go here.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
});