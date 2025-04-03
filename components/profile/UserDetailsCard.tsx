'use client';

import Image from 'next/image';
import { Pencil } from 'lucide-react';

import { UserProfileDetailsAdmin } from '@/actions/user';
import { useModal } from '@/hooks/useModal';
import EditProfileModal from './EditProfileModal';

interface UserDetailsCardProps {
    user: UserProfileDetailsAdmin | null;
}

const UserDetailsCard = ({ user }: UserDetailsCardProps) => {
    const { openModal, isOpen, closeModal } = useModal();

    if (!user) return 'No user found';

    return (
        <>
            <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex w-full flex-col items-center gap-6 xl:flex-row">
                        <div className="h-20 w-20 overflow-hidden rounded-full border border-gray-200 dark:border-gray-800">
                            <Image
                                width={80}
                                height={80}
                                src={user.image || '/images/user/profile.jpg'}
                                alt="user"
                            />
                        </div>
                        <div className="order-3 xl:order-2">
                            <h4 className="mb-2 text-center text-lg font-semibold text-gray-800 xl:text-left dark:text-white/90">
                                {`${user.firstName} ${user.lastName}`}
                            </h4>
                            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {user.adminUser
                                        ? user.adminUser.jobTitle
                                        : user.merchantUser?.jobTitle}
                                </p>
                                <div className="hidden h-3.5 w-px bg-gray-300 xl:block dark:bg-gray-700"></div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {`${user.city}, ${user.state?.country.name}`}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={openModal}
                        className="shadow-theme-xs flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 lg:inline-flex lg:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 cursor-pointer"
                    >
                        <Pencil className="size-[18px]" />
                        Edit
                    </button>
                </div>
                <EditProfileModal
                    isOpen={isOpen}
                    closeModal={closeModal}
                    user={user}
                />
            </div>
            <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-800 lg:mb-6 dark:text-white/90">
                            Personal Information
                        </h4>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                            <div>
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                    First Name
                                </p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                    {user.firstName}
                                </p>
                            </div>

                            <div>
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                    Last Name
                                </p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                    {user.lastName}
                                </p>
                            </div>

                            <div>
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                    Email address
                                </p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                    {user.email}
                                </p>
                            </div>

                            <div>
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                    Phone
                                </p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                    {user.phoneNumber}
                                </p>
                            </div>

                            <div>
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                    Job Title
                                </p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                    {user.adminUser
                                        ? user.adminUser.jobTitle
                                        : user.merchantUser?.jobTitle}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-800 lg:mb-6 dark:text-white/90">
                            Address
                        </h4>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                            <div>
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                    City/State
                                </p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                    {`${user.city}, ${user.state?.name}`}
                                </p>
                            </div>
                            <div>
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                    Country
                                </p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                    {user.state?.country?.name}
                                </p>
                            </div>
                            <div>
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                    Post Code
                                </p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                    {user.postcode}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default UserDetailsCard;
