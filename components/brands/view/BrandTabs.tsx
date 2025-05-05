'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/sliding-underline-tabs';
import { motion } from 'framer-motion';
import { BrandTabsProps } from '@/types/brand';
import { BrandUsersTable } from './users/BrandUsersTable';
import { BrandStoresTable } from './stores/BrandStoresTable';

const BrandTabs = ({
    brandUsersPromise,
    brandStoresPromise,
    brand,
    user
}: BrandTabsProps) => {
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
                    Stores
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
                <BrandUsersTable
                    brandUsersPromise={brandUsersPromise}
                    brand={brand}
                    user={user}
                />
            </TabsContent>
            <TabsContent value="brands" className="mt-4">
                <BrandStoresTable
                    brandStoresPromise={brandStoresPromise}
                    user={user}
                    brand={brand}
                />
                Stores coming soon
            </TabsContent>
        </Tabs>
    );
};

export default BrandTabs;
