import { StyleSheet, Text, View } from 'react-native';

export default function TodayScreen() {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone: 'Europe/Brussels',
    });

    return (
        <View style={styles.container}>
            <View style={styles.scrapbook}>
                <Text style={styles.title}>Today's scrapbook</Text>
            </View>
        </View>
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

    scrapbook: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
    },
});