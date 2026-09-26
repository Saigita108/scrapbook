import ScrapbookPage from '@/components/ScrapbookPage';
import useToday from '@/hooks/useToday';
import { getDateKey } from '@/utils/calendar';

export default function TodayScreen() {
    const date = getDateKey(useToday());
    return <ScrapbookPage key={date} date={date} />;
}
