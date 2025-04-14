'use client';

import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { useSidebar } from '@/context/SidebarContext';

export default function LayoutProvider({
    children
}: {
    children: React.ReactNode;
}) {
    const { isExpanded, isHovered, isMobileOpen } = useSidebar();

    const mainContentMargin = isMobileOpen
        ? 'ml-0'
        : isExpanded || isHovered
          ? 'lg:ml-[290px]'
          : 'lg:ml-[90px]';

    return (
        <div
            className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
        >
            <NuqsAdapter>{children}</NuqsAdapter>
        </div>
    );
}
