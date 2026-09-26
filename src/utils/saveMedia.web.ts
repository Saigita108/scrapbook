export async function saveMedia(uri: string): Promise<string> {
    if (!uri.startsWith('blob:')) return uri;
    const blob = await (await fetch(uri)).blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
}
