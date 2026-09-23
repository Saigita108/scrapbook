import type { Sticker } from '../components/StickerComponent';

export const KLIPY_API_KEY = process.env.EXPO_PUBLIC_KLIPY_API_KEY?.trim();

type FileFormat = { url?: string };
type KlipyItem = {
    slug?: string;
    title?: string;
    file?: Partial<Record<'xs' | 'sm' | 'md' | 'hd', {
        webp?: FileFormat;
        gif?: FileFormat;
        png?: FileFormat;
    }>>;
};

export async function fetchKlipyStickers(query: string, page: number, signal: AbortSignal) {
    if (!KLIPY_API_KEY) throw new Error('Klipy is not configured.');

    const params = new URLSearchParams({ page: String(page), per_page: '24' });
    const search = query.trim();
    if (search) params.set('q', search);

    const response = await fetch(
        `https://api.klipy.com/api/v1/${encodeURIComponent(KLIPY_API_KEY)}/stickers/${search ? 'search' : 'trending'}?${params}`,
        { signal },
    );
    if (!response.ok) throw new Error('Could not load stickers. Please try again.');

    const body = await response.json();
    if (body.result !== true || !Array.isArray(body.data?.data)) {
        throw new Error('Could not load stickers. Please try again.');
    }

    const stickers: Sticker[] = body.data.data.flatMap((item: KlipyItem | null) => {
        if (!item?.slug || !item.file) return [];
        const formats = item.file.md ?? item.file.sm ?? item.file.hd ?? item.file.xs;
        const uri = formats?.webp?.url ?? formats?.gif?.url ?? formats?.png?.url;
        if (!uri || !uri.startsWith('https://')) return [];
        return [{ id: `klipy-${item.slug}`, title: item.title || 'Klipy sticker', source: { uri } }];
    });

    return { stickers, hasNext: body.data.has_next === true };
}
