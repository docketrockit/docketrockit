import LayoutProvider from '@/providers/LayoutProvider';
import AppHeader from '@/components/layout/AppHeader';
import AppSidebar from '@/components/layout/AppSidebar';
import Backdrop from '@/components/layout/Backdrop';

import { authCheckLayout } from '@/lib/authCheck';

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
    const { session, user } = await authCheckLayout();

    if (!session || !user) return <div>Not allowed here</div>;

    return (
        <div className="min-h-screen xl:flex">
            {/* Sidebar and Backdrop */}
            <AppSidebar user={user} />
            <Backdrop />
            {/* Main Content Area */}
            <LayoutProvider>
                {/* Header */}
                <AppHeader session={session} user={user} />
                {/* Page Content */}
                <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
                    {children}
                </div>
            </LayoutProvider>
        </div>
    );
};

export default AdminLayout;
