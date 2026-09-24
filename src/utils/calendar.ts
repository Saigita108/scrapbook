export function getToday(now = new Date()) {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Brussels', year: 'numeric', month: 'numeric', day: 'numeric',
    }).formatToParts(now);
    const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);
    return { year: value('year'), month: value('month') - 1, day: value('day') };
}

export function getMonthIndex(date: { year: number; month: number }) {
    return date.year * 12 + date.month;
}

export function getMonthDate(month: number) {
    return new Date(Math.floor(month / 12), month % 12, 1, 12);
}

export function getMonthDays(month: number): (number | null)[] {
    const date = getMonthDate(month);
    const offset = (date.getDay() + 6) % 7;
    const count = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    return Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, index) => {
        const day = index - offset + 1;
        return day >= 1 && day <= count ? day : null;
    });
}
