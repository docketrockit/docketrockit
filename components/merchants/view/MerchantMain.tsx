'use client';

import Image from 'next/image';
import { Pencil } from 'lucide-react';
import { AdminRole } from '@prisma/client';
import parsePhoneNumber, { PhoneNumber } from 'libphonenumber-js';

import { MerchantMainProps } from '@/types/merchant';
import Link from 'next/link';
import MerchantTabs from './MerchantTabs';

const MerchantMain = ({
    merchant,
    merchantUsersPromise,
    merchantBrandsPromise,
    user
}: MerchantMainProps) => {
    if (!merchant) return 'No merchant found';

    const primaryContact = merchant.primaryContact;

    let phoneNumber: PhoneNumber | undefined;

    if (primaryContact && primaryContact.phoneNumber) {
        phoneNumber = parsePhoneNumber(primaryContact.phoneNumber);
    }

    return (
        <>
            <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex w-full flex-col items-center gap-6 xl:flex-row">
                        <div className="h-20 w-20 overflow-hidden rounded-full border border-gray-200 dark:border-gray-800">
                            <Image
                                width={80}
                                height={80}
                                src={
                                    merchant.logoUrl ||
                                    '/images/logo/blanklogo.jpg'
                                }
                                alt={merchant.name}
                                className="items-center"
                            />
                        </div>
                        <div className="order-3 xl:order-2">
                            <h4 className="mb-2 text-center text-lg font-semibold text-gray-800 xl:text-left dark:text-white/90">
                                {merchant.name}
                            </h4>
                            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {merchant.status}
                                </p>
                                <div className="hidden h-3.5 w-px bg-gray-300 xl:block dark:bg-gray-700"></div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {`${merchant.state.name}, ${merchant.country.name}`}
                                </p>
                            </div>
                        </div>
                    </div>
                    {[AdminRole.ADMIN, AdminRole.SALES].some((role) =>
                        user.adminUser?.adminRole.includes(role)
                    ) && (
                        <Link href={`/admin/merchants/edit/${merchant.slug}`}>
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
                <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800 w-full">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800 lg:mb-6 dark:text-white/90">
                                Merchant Information
                            </h4>

                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                                <div>
                                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                        Phone Number
                                    </p>
                                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                        {merchant.phoneNumber}
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
                                        Email Address
                                    </p>
                                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                        <a
                                            href={`mailto:${merchant.genericEmail}`}
                                        >
                                            {merchant.genericEmail}
                                        </a>
                                    </p>
                                </div>

                                <div>
                                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                        Invoice Email Address
                                    </p>
                                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                        <a
                                            href={`mailto:${merchant.invoiceEmail}`}
                                        >
                                            {merchant.invoiceEmail}
                                        </a>
                                    </p>
                                </div>

                                <div>
                                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                        ABN
                                    </p>
                                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                        {merchant.abn}
                                    </p>
                                </div>

                                <div>
                                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                        ACN
                                    </p>
                                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                        {merchant.acn}
                                    </p>
                                </div>
                                {primaryContact && (
                                    <>
                                        <div>
                                            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                                Primary Contact
                                            </p>
                                            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                                {`${primaryContact.firstName} ${primaryContact.lastName}`}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                                Primary Contact Email
                                            </p>
                                            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                                {primaryContact.email}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                                Primary Contact Phone
                                            </p>
                                            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                                {phoneNumber &&
                                                    phoneNumber.formatNational()}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
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
                                        {merchant.address1}
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                        Address Line 1
                                    </p>
                                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                        {merchant.address2}
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                        Suburb
                                    </p>
                                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                        {merchant.suburb}
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                        Postcode
                                    </p>
                                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                        {merchant.postcode}
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                        State
                                    </p>
                                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                        {merchant.state.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                        Country
                                    </p>
                                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                        {merchant.country.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800 w-full">
                <MerchantTabs
                    merchantUsersPromise={merchantUsersPromise}
                    merchantBrandsPromise={merchantBrandsPromise}
                    merchant={merchant}
                    user={user}
                />
            </div>
        </>
    );
};
export default MerchantMain;
