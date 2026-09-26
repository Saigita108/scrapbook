// Match the Brussels dates used by the scrapbook, including daylight-saving days.
function midnight(date: string) {
    const target = Date.parse(`${date}T00:00:00Z`);
    let timestamp = target;
    for (let attempt = 0; attempt < 3; attempt++) {
        const parts = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Europe/Brussels', year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
        }).formatToParts(new Date(timestamp));
        const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);
        const represented = Date.UTC(value('year'), value('month') - 1, value('day'), value('hour'), value('minute'), value('second'));
        timestamp += target - represented;
    }
    return new Date(timestamp);
}

export function getStepRange(date: string, now = new Date()) {
    const next = new Date(`${date}T12:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    const start = midnight(date);
    const end = new Date(Math.min(midnight(next.toISOString().slice(0, 10)).getTime(), now.getTime()));
    if (start >= end) throw new Error('Steps are available only for today or a previous day.');
    // Reject partial history rather than presenting it as a complete daily total.
    if (start.getTime() < now.getTime() - 7 * 24 * 60 * 60 * 1000) {
        throw new Error('The phone only keeps seven days of step history. Choose a more recent day.');
    }
    return { start, end };
}
