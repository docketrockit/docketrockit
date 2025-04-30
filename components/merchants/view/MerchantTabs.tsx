'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/sliding-underline-tabs';
import { motion } from 'framer-motion';
import { MerchantTabsProps } from '@/types/merchant';
import { MerchantUsersTable } from './users/MerchantUsersTable';
import { MerchantBrandsTable } from './brands/MerchantBrandsTable';

const MerchantTabs = ({
    merchantUsersPromise,
    merchantBrandsPromise,
    merchant,
    user
}: MerchantTabsProps) => {
    const [activeTab, setActiveTab] = useState('users');
    const [underlineWidth, setUnderlineWidth] = useState(0);
    const [underlineLeft, setUnderlineLeft] = useState(0);
    const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

    useEffect(() => {
        const activeTabElement = tabsRef.current.find(
            (tab) => tab?.getAttribute('data-state') === 'active'
        );
        if (activeTabElement) {
            setUnderlineWidth(activeTabElement.offsetWidth);
            setUnderlineLeft(activeTabElement.offsetLeft);
        }
    }, [activeTab]);

    return (
        <Tabs
            defaultValue="account"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
        >
            <TabsList className="w-full justify-start border-b border-border">
                <TabsTrigger
                    value="users"
                    ref={(el) => {
                        tabsRef.current[0] = el;
                    }}
                    className="w-full"
                >
                    Users
                </TabsTrigger>
                <TabsTrigger
                    value="brands"
                    ref={(el) => {
                        tabsRef.current[1] = el;
                    }}
                    className="w-full"
                >
                    Brands
                </TabsTrigger>
                <motion.div
                    className="absolute bottom-0 h-0.5 bg-primary"
                    initial={false}
                    animate={{
                        width: underlineWidth,
                        left: underlineLeft
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30
                    }}
                />
            </TabsList>
            <TabsContent value="users" className="mt-4">
                <MerchantUsersTable
                    merchantUsersPromise={merchantUsersPromise}
                    merchant={merchant}
                    user={user}
                />
            </TabsContent>
            <TabsContent value="brands" className="mt-4">
                <MerchantBrandsTable
                    merchantBrandsPromise={merchantBrandsPromise}
                    user={user}
                    merchant={merchant}
                />
            </TabsContent>
        </Tabs>
    );
};

export default MerchantTabs;
