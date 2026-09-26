import StorageGate from '@/components/StorageGate';
import { DMSans_400Regular, useFonts } from '@expo-google-fonts/dm-sans';
import { IndieFlower_400Regular } from '@expo-google-fonts/indie-flower';
import { Unbounded_400Regular } from '@expo-google-fonts/unbounded';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ DMSans: DMSans_400Regular, IndieFlower: IndieFlower_400Regular, Unbounded: Unbounded_400Regular });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StorageGate>
        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false }}
          />
        </Stack>
      </StorageGate>
    </GestureHandlerRootView>
  );
}