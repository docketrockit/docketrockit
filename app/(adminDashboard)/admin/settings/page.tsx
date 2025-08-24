import { Metadata } from 'next';

import { getUserProfileDetailsAdmin } from '@/actions/auth/dashboardUser';
import { authCheckAdmin } from '@/lib/authCheck';
import SettingsMain from '@/components/settings/SettingsMain';
import {
    getAllCountries,
    getCountryByName,
    getRegionsByCountry,
    getRegionById,
    getCountryById
} from '@/lib/location';

export async function generateMetadata(): Promise<Metadata> {
    const title = 'Settings';
    const description = 'The DocketRockit Merchant Admin Dashboard';

    return {
        title,
        description
    };
}

const ProfilePage = async () => {
    const userSession = await authCheckAdmin('/admin/settings');
    const { user } = userSession;

    const countries = await getAllCountries();
    const defaultCountry = await getCountryByName('Australia');
    if (!defaultCountry) return null;
    const initialValueProp = user?.countryId ? true : false;
    const regions = user?.countryId
        ? await getRegionsByCountry(user.countryId)
        : await getRegionsByCountry(defaultCountry.id);
    const country = user?.countryId
        ? await getCountryById(user.countryId)
        : await getCountryById(defaultCountry.id);
    const region = user?.countryId
        ? await getRegionById(user.regionId || '')
        : await getRegionById(defaultCountry.id);

    const location = {
        countries,
        defaultCountry,
        regions,
        country,
        region,
        initialValueProp
    };

    return (
        <div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                {/* <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
                    Settings
                </h3> */}
                <div className="flex flex-row gap-20">
                    <SettingsMain
                        userSession={userSession}
                        location={location}
                    />
                </div>
            </div>
        </div>
    );
};
export default ProfilePage;
