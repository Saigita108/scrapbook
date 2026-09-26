import { Directory, File, Paths } from 'expo-file-system';

export async function saveMedia(uri: string): Promise<string> {
    if (/^(https?:|data:)/.test(uri)) return uri;
    const directory = new Directory(Paths.document, 'scrapbook');
    directory.create({ idempotent: true, intermediates: true });
    const extension = uri.split('?')[0].match(/\.[a-zA-Z0-9]+$/)?.[0] ?? '';
    const destination = new File(directory, `${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`);
    new File(uri).copy(destination);
    return destination.uri;
}
