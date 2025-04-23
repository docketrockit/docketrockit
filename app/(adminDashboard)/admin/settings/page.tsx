import NotificationsCard from '@/components/settings/NotificationsCard';
import { getUserProfileDetailsAdmin } from '@/actions/auth/dashboardUser';
import { authCheckAdmin } from '@/lib/authCheck';

export async function generateMetadata() {
    const title = 'Settings';
    const description = 'The DocketRockit Merchant Admin Dashboard';

    return {
        title,
        description
    };
}

const ProfilePage = async () => {
    const { user } = await authCheckAdmin();

    const userDetails = await getUserProfileDetailsAdmin(user.id);

    return (
        <div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
                    Settings
                </h3>
                <div className="space-y-6">
                    <NotificationsCard user={userDetails.data} />
                </div>
            </div>
        </div>
    );
};
export default ProfilePage;
