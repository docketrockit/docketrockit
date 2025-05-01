'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Role, AdminRole, MerchantRole } from '@prisma/client';

import { useSidebar } from '@/context/SidebarContext';
import {
    GridIcon,
    TableProperties,
    UserCircleIcon,
    ChevronDownIcon,
    Ellipsis,
    FileText,
    Building2,
    UsersRound
} from 'lucide-react';
import { SessionUserProps } from '@/types/global';
import { User } from '@/lib/user';

import logo from '../../public/images/logo/logo.png';
import logoWhite from '../../public/images/logo/logo-white.png';
import logoIcon from '../../public/images/logo/logoiconblack.png';
import logoIconWhite from '../../public/images/logo/logoiconwhite.png';

type NavItem = {
    name: string;
    icon?: React.ReactNode;
    path?: string;
    rolesAllowed: AdminRole[] | MerchantRole[];
    subItems?: NavItem[];
};

const navItemsAdmin: NavItem[] = [
    {
        icon: <GridIcon />,
        name: 'Dashboard',
        path: '/admin',
        rolesAllowed: []
    },
    {
        name: 'Users',
        icon: <UsersRound />,
        rolesAllowed: [],
        subItems: [
            {
                name: 'View Admin Users',
                path: '/admin/users/admin',
                rolesAllowed: ['ADMIN']
            },
            {
                name: 'View Merchant Users',
                path: '/admin/users/merchants',
                rolesAllowed: []
            },
            {
                name: 'View Consumer Users',
                path: '/admin/users/consumers',
                rolesAllowed: []
            }
        ]
    },
    {
        name: 'Merchants',
        icon: <Building2 />,
        rolesAllowed: [],
        subItems: [
            {
                name: 'Add Merchant',
                path: '/admin/merchants/add',
                rolesAllowed: ['ADMIN', 'SALES']
            },
            {
                name: 'View Merchants',
                path: '/admin/merchants',
                rolesAllowed: []
            }
        ]
    }
    // {
    //     icon: <TableProperties />,
    //     name: 'Reports',
    //     path: '/reports'
    // },
    // {
    //     icon: <UserCircleIcon />,
    //     name: 'Users',
    //     path: '/users'
    // },
    // {
    //     name: 'Invoices',
    //     icon: <FileText />,
    //     path: '/invoices'
    // }
];

const navItemsMerchant: NavItem[] = [
    {
        icon: <GridIcon />,
        name: 'Dashboard',
        path: '/merchant',
        rolesAllowed: []
    }
];

const checkRoles = (
    rolesAllowed: AdminRole[] | MerchantRole[],
    user: User
): boolean => {
    if (rolesAllowed.length === 0) return true;

    if (user.adminUser) {
        return rolesAllowed.some((role) =>
            user.adminUser?.adminRole.includes(role as AdminRole)
        );
    }

    if (user.merchantUser) {
        return rolesAllowed.some((role) =>
            user.merchantUser?.merchantRole.includes(role as MerchantRole)
        );
    }

    return false;
};

const hasAccess = (nav: NavItem, user: User): boolean => {
    return (
        (checkRoles(nav.rolesAllowed, user) ||
            nav.subItems?.some((sub) => checkRoles(sub.rolesAllowed, user))) ??
        false
    );
};

const getAccessibleSubItems = (subItems: NavItem[] = [], user: User) => {
    return subItems.filter((sub) => checkRoles(sub.rolesAllowed, user));
};

const AppSidebar: React.FC<SessionUserProps> = ({ session, user }) => {
    const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
    const pathname = usePathname();

    const [openSubmenu, setOpenSubmenu] = useState<{
        type: 'main' | 'others';
        index: number;
    } | null>(null);

    const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
        {}
    );

    const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const isActive = useCallback(
        (path: string) => path === pathname,
        [pathname]
    );

    const handleSubmenuToggle = (
        index: number,
        menuType: 'main' | 'others'
    ) => {
        setOpenSubmenu((prev) =>
            prev?.type === menuType && prev?.index === index
                ? null
                : { type: menuType, index }
        );
    };

    useEffect(() => {
        ['main', 'others'].forEach((menuType) => {
            const items = user.adminUser ? navItemsAdmin : navItemsMerchant;
            items.forEach((nav, index) => {
                const accessibleSubItems = getAccessibleSubItems(
                    nav.subItems,
                    user
                );
                if (
                    nav.subItems &&
                    accessibleSubItems.some((sub) => isActive(sub.path ?? ''))
                ) {
                    setOpenSubmenu({
                        type: menuType as 'main' | 'others',
                        index
                    });
                }
            });
        });
    }, [pathname, user]);

    useEffect(() => {
        if (openSubmenu !== null) {
            const key = `${openSubmenu.type}-${openSubmenu.index}`;
            if (subMenuRefs.current[key]) {
                setSubMenuHeight((prev) => ({
                    ...prev,
                    [key]: subMenuRefs.current[key]?.scrollHeight || 0
                }));
            }
        }
    }, [openSubmenu]);

    const renderMenuItems = (
        navItems: NavItem[],
        menuType: 'main' | 'others'
    ) => (
        <ul className="flex flex-col gap-4">
            {navItems
                .filter((nav) => hasAccess(nav, user))
                .map((nav, index) => {
                    const accessibleSubItems = getAccessibleSubItems(
                        nav.subItems,
                        user
                    );

                    return (
                        <li key={nav.name}>
                            {nav.subItems && accessibleSubItems.length > 0 ? (
                                <button
                                    onClick={() =>
                                        handleSubmenuToggle(index, menuType)
                                    }
                                    className={`menu-item group ${
                                        openSubmenu?.type === menuType &&
                                        openSubmenu?.index === index
                                            ? 'menu-item-active'
                                            : 'menu-item-inactive'
                                    }`}
                                >
                                    <span className="menu-item-icon">
                                        {nav.icon}
                                    </span>
                                    {(isExpanded ||
                                        isHovered ||
                                        isMobileOpen) && (
                                        <span className="menu-item-text">
                                            {nav.name}
                                        </span>
                                    )}
                                    {(isExpanded ||
                                        isHovered ||
                                        isMobileOpen) && (
                                        <ChevronDownIcon
                                            className={`ml-auto h-5 w-5 transition-transform duration-200 ${
                                                openSubmenu?.type ===
                                                    menuType &&
                                                openSubmenu?.index === index
                                                    ? 'rotate-180 text-brand-500'
                                                    : ''
                                            }`}
                                        />
                                    )}
                                </button>
                            ) : (
                                nav.path &&
                                checkRoles(nav.rolesAllowed, user) && (
                                    <Link
                                        href={nav.path}
                                        className={`menu-item group ${
                                            isActive(nav.path)
                                                ? 'menu-item-active'
                                                : 'menu-item-inactive'
                                        }`}
                                    >
                                        <span className="menu-item-icon">
                                            {nav.icon}
                                        </span>
                                        {(isExpanded ||
                                            isHovered ||
                                            isMobileOpen) && (
                                            <span className="menu-item-text">
                                                {nav.name}
                                            </span>
                                        )}
                                    </Link>
                                )
                            )}

                            {accessibleSubItems.length > 0 &&
                                (isExpanded || isHovered || isMobileOpen) && (
                                    <div
                                        ref={(el) => {
                                            subMenuRefs.current[
                                                `${menuType}-${index}`
                                            ] = el;
                                        }}
                                        className="overflow-hidden transition-all duration-300"
                                        style={{
                                            height:
                                                openSubmenu?.type ===
                                                    menuType &&
                                                openSubmenu?.index === index
                                                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                                                    : '0px'
                                        }}
                                    >
                                        <ul className="mt-2 ml-9 space-y-1">
                                            {accessibleSubItems.map(
                                                (subItem) =>
                                                    subItem.path && (
                                                        <li key={subItem.name}>
                                                            <Link
                                                                href={
                                                                    subItem.path
                                                                }
                                                                className={`menu-dropdown-item ${
                                                                    isActive(
                                                                        subItem.path
                                                                    )
                                                                        ? 'menu-dropdown-item-active'
                                                                        : 'menu-dropdown-item-inactive'
                                                                }`}
                                                            >
                                                                {subItem.name}
                                                            </Link>
                                                        </li>
                                                    )
                                            )}
                                        </ul>
                                    </div>
                                )}
                        </li>
                    );
                })}
        </ul>
    );

    return (
        <aside
            className={`fixed top-0 left-0 z-50 mt-16 flex h-screen flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out lg:mt-0 dark:border-gray-800 dark:bg-gray-900 ${
                isExpanded || isMobileOpen
                    ? 'w-[290px]'
                    : isHovered
                      ? 'w-[290px]'
                      : 'w-[90px]'
            } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            onMouseEnter={() => !isExpanded && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex py-8">
                <Link href="/">
                    <Image
                        className="dark:hidden"
                        src={logo}
                        alt="Logo"
                        width={150}
                        height={40}
                    />
                </Link>
            </div>
            <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
                <nav className="mb-6">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2 className="mb-4 text-xs leading-[20px] text-gray-400 uppercase">
                                Menu
                            </h2>
                            {renderMenuItems(
                                user.adminUser
                                    ? navItemsAdmin
                                    : navItemsMerchant,
                                'main'
                            )}
                        </div>
                    </div>
                </nav>
            </div>
        </aside>
    );
};

export default AppSidebar;
