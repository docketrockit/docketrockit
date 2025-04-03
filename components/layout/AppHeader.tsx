'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { AlignLeft, Ellipsis, X } from 'lucide-react';

import { ThemeToggleButton } from '@/components/common/ThemeToggleButton';
import NotificationDropdown from '@/components/header/NotificationDropdown';
import UserDropdown from '@/components/header/UserDropdown';
import { useSidebar } from '@/context/SidebarContext';
import { SessionUserProps } from '@/types/global';

const AppHeader: React.FC<SessionUserProps> = ({ session, user }) => {
    const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);

    const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

    const handleToggle = () => {
        if (window.innerWidth >= 991) {
            toggleSidebar();
        } else {
            toggleMobileSidebar();
        }
    };

    const toggleApplicationMenu = () => {
        setApplicationMenuOpen(!isApplicationMenuOpen);
    };
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault();
                inputRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <header className="sticky top-0 z-99999 flex w-full border-gray-200 bg-white lg:border-b dark:border-gray-800 dark:bg-gray-900">
            <div className="flex grow flex-col items-center justify-between lg:flex-row lg:px-6">
                <div className="flex w-full items-center justify-between gap-2 border-b border-gray-200 px-3 py-3 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4 dark:border-gray-800">
                    <button
                        className="z-99999 h-10 w-10 items-center justify-center rounded-lg border-gray-200 text-gray-500 lg:flex lg:h-11 lg:w-11 lg:border dark:border-gray-800 dark:text-gray-400"
                        onClick={handleToggle}
                        aria-label="Toggle Sidebar"
                    >
                        {isMobileOpen ? (
                            <X className="size-6" />
                        ) : (
                            <AlignLeft className="w-6 h-5" />
                        )}
                        {/* Cross Icon */}
                    </button>

                    <Link href="/" className="lg:hidden">
                        <Image
                            width={154}
                            height={32}
                            className="dark:hidden"
                            src="/images/logo/logo.png"
                            alt="Logo"
                        />
                        <Image
                            width={154}
                            height={32}
                            className="hidden dark:block"
                            src="/images/logo/logo-white.png"
                            alt="Logo"
                        />
                    </Link>

                    <button
                        onClick={toggleApplicationMenu}
                        className="z-99999 flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 lg:hidden dark:text-gray-400 dark:hover:bg-gray-800"
                    >
                        <Ellipsis className="size-6" />
                    </button>
                </div>
                <div
                    className={`${
                        isApplicationMenuOpen ? 'flex' : 'hidden'
                    } shadow-theme-md w-full items-center justify-between gap-4 px-5 py-4 lg:flex lg:justify-end lg:px-0 lg:shadow-none`}
                >
                    <div className="2xsm:gap-3 flex items-center gap-2">
                        {/* <!-- Dark Mode Toggler --> */}
                        <ThemeToggleButton />
                        {/* <!-- Dark Mode Toggler --> */}

                        <NotificationDropdown />
                        {/* <!-- Notification Menu Area --> */}
                    </div>
                    {/* <!-- User Area --> */}
                    <UserDropdown session={session} user={user} />
                </div>
            </div>
        </header>
    );
};

export default AppHeader;
