import { DateTime } from 'luxon';

export type GroupedTimezones = {
    region: string;
    zones: {
        label: string;
        value: string;
    }[];
};

export const getGroupedTimezones = (): GroupedTimezones[] => {
    const zones = Intl.supportedValuesOf('timeZone');

    const grouped: Record<string, GroupedTimezones['zones']> = {};

    zones.forEach((zone) => {
        const region = zone.split('/')[0];
        const dt = DateTime.now().setZone(zone);

        const label = `${zone} (UTC${dt.toFormat('Z')}) – ${dt.toFormat('hh:mm a')}`;

        if (!grouped[region]) grouped[region] = [];

        grouped[region].push({ label, value: zone });
    });

    return Object.entries(grouped).map(([region, zones]) => ({
        region,
        zones
    }));
};
