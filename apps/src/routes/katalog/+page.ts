import { mockMenus } from '$lib/mock/menu';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
    // Generate metadata for the 7-day Date Scroller
    const dateItems = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        
        return {
            date: dateStr,
            label: i === 0 ? 'HARI INI' : d.toLocaleDateString('id-ID', { weekday: 'short' }).toUpperCase(),
            dayNum: d.getDate(),
            fullLabel: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
        };
    });

    const selectedDate = url.searchParams.get('date') || dateItems[0].date;

    return {
        menus: mockMenus,
        selectedDate,
        dateItems
    };
};
