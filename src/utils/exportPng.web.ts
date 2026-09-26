export async function sharePng(uri: string, filename: string) {
    const file = new File([await (await fetch(uri)).blob()], filename, { type: 'image/png' });
    if (!navigator.canShare?.({ files: [file] })) {
        throw new Error('Sharing is unavailable in this browser.');
    }
    await navigator.share({ files: [file], title: 'Scrapbook' });
}

export async function savePng(uri: string, filename: string) {
    const link = document.createElement('a');
    link.href = uri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
}
