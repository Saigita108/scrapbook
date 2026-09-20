import { StyleSheet, Text, View } from 'react-native';

export default function TodayScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Today</Text>
            <Text>This will become today's scrapbook.</Text>
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