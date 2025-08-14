'use client';

import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { AdminRole } from '@/generated/prisma';
import parsePhoneNumber, { PhoneNumber } from 'libphonenumber-js';
import { AdvancedMarker, Map } from '@vis.gl/react-google-maps';

import { StoreMainProps } from '@/types/store';
import { formatABN, formatACN } from '@/utils/businessNumberValidation';
import GoogleMap from '@/components/maps/GoogleMap';

const StoreMain = ({ store, user }: StoreMainProps) => {
    if (!store) return 'No store found';

    let phoneNumber: PhoneNumber | undefined;

    if (store.phoneNumber) {
        phoneNumber = parsePhoneNumber(store.phoneNumber);
    }

    return (
        <>
            <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex w-full flex-col items-center gap-6 xl:flex-row">
                        <div className="order-3 xl:order-2">
                            <div className="flex flex-row">
                                <h4 className="mb-2 text-center text-lg font-semibold text-gray-800 xl:text-left dark:text-white/90">
                                    {store.name}
                                </h4>
                            </div>
                            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {store.status}
                                </p>
                                <div className="hidden h-3.5 w-px bg-gray-300 xl:block dark:bg-gray-700"></div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {`${store.region}, ${store.country.name}`}
                                </p>
                            </div>
                        </div>
                    </div>
                    {[AdminRole.ADMIN, AdminRole.SALES].some((role) =>
                        user.adminUser?.adminRole.includes(role)
                    ) && (
                        <Link href={`/admin/stores/edit/${store.slug}`}>
                            <button
                                type="button"
                                className="shadow-theme-xs flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 lg:inline-flex lg:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 cursor-pointer"
                            >
                                <Pencil className="size-[18px]" />
                                Edit
                            </button>
                        </Link>
                    )}
                </div>
            </div>
            <div className="flex flex-row space-x-6 w-full">
                <div className="flex flex-col space-y-6 w-full">
                    <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800 w-full">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800 lg:mb-6 dark:text-white/90">
                                    Store Information
                                </h4>

                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            Phone Number
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {phoneNumber &&
                                                phoneNumber.formatNational()}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            &nbsp;
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            &nbsp;
                                        </p>
                                    </div>

                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            ABN
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {formatABN(store.abn || '')}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            ACN
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {formatACN(store.acn || '')}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            Currency
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {`${store.currency.code} - ${store.currency.name}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col space-y-6 w-full">
                    <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800 w-full">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800 lg:mb-6 dark:text-white/90">
                                    Address
                                </h4>

                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            Address Line 1
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {store.address1}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            Address Line 1
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {store.address2}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            Suburb
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {store.city}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            Postcode
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {store.postalCode}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            State
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {store.region}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            Country
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {store.country.name}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800 w-full min-h-fit">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <GoogleMap
                                lat={store.latitude}
                                lng={store.longitude}
                                className="h-96"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default StoreMain;
