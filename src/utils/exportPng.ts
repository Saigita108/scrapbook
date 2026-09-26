import { Directory, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function sharePng(uri: string, _filename: string) {
    if (!await Sharing.isAvailableAsync()) {
        throw new Error('Sharing is unavailable on this device.');
    }
    await Sharing.shareAsync(uri, {
        mimeType: 'image/png', UTI: 'public.png', dialogTitle: 'Share scrapbook',
    });
}

export async function savePng(uri: string, filename: string) {
    const directory = await Directory.pickDirectoryAsync();
    // Include a timestamp so repeated exports never overwrite an earlier image.
    const destination = directory.createFile(filename.replace('.png', `-${Date.now()}.png`), 'image/png');
    destination.write(await new File(uri).bytes());
}
