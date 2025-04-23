'use client';

import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
import { ChevronDown, CircleUser, Settings, Info, LogOut } from 'lucide-react';

import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem';
import { logoutAction } from '@/actions/auth/logout';
import { SessionUserProps } from '@/types/global';

const UserDropdown = ({ session, user }: SessionUserProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.stopPropagation();
        setIsOpen((prev) => !prev);
    };

    const closeDropdown = () => {
        setIsOpen(false);
    };

    const onLogout = async () => {
        const data = await logoutAction();
        if (data.message) {
            toast.error(data.message);
        }
    };

    const urlLocation = user.adminUser ? 'admin' : 'merchant';

    return (
        <div className="relative">
            <button
                onClick={toggleDropdown}
                className="dropdown-toggle flex items-center text-gray-700 dark:text-gray-400"
            >
                <span className="mr-3 h-11 w-11 overflow-hidden rounded-full">
                    <Image
                        width={44}
                        height={44}
                        src={user.image || '/images/user/profile.jpg'}
                        alt="User"
                    />
                </span>

                <div className="flex flex-col">
                    <span className="text-theme-sm mr-1 block font-medium">
                        {`${user.firstName} ${user.lastName}`}
                    </span>
                    <span className="font-sm text-theme-sm mr-1 block">
                        {user.merchantUser
                            ? user.merchantUser?.merchant
                            : 'DocketRockit'}
                    </span>
                </div>
                <ChevronDown
                    strokeWidth={2.5}
                    className={`stroke-gray-500 transition-transform duration-200 dark:stroke-gray-400 w-5 h-5 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </button>

            <Dropdown
                isOpen={isOpen}
                onClose={closeDropdown}
                className="shadow-theme-lg dark:bg-gray-dark absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800"
            >
                <div>
                    <span className="text-theme-sm block font-medium text-gray-700 dark:text-gray-400">
                        {`${user.firstName} ${user.lastName}`}
                    </span>
                    <span className="text-theme-xs mt-0.5 block text-gray-500 dark:text-gray-400">
                        {user.email}
                    </span>
                </div>

                <ul className="flex flex-col gap-1 border-b border-gray-200 pt-4 pb-3 dark:border-gray-800">
                    <li>
                        <DropdownItem
                            onItemClick={closeDropdown}
                            tag="a"
                            href={`/${urlLocation}/profile`}
                            className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                        >
                            <CircleUser className="text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300 size-6" />
                            User Profile
                        </DropdownItem>
                    </li>
                    <li>
                        <DropdownItem
                            onItemClick={closeDropdown}
                            tag="a"
                            href={`/${urlLocation}/settings`}
                            className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                        >
                            <Settings className="text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300 size-6" />
                            Account settings
                        </DropdownItem>
                    </li>
                    <li>
                        <DropdownItem
                            onItemClick={closeDropdown}
                            tag="a"
                            href={`/${urlLocation}/support`}
                            className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                        >
                            <Info className="text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300 size-6" />
                            Support
                        </DropdownItem>
                    </li>
                </ul>
                <div
                    className="cursor-pointer group text-theme-sm mt-3 flex items-center gap-3 rounded-lg pl-4 pr-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                    onClick={onLogout}
                >
                    <LogOut className="text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300 size-6" />
                    Sign out
                </div>
            </Dropdown>
        </div>
    );
};

export default UserDropdown;
