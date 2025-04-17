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

type RoleAccess =
    | { role: 'ADMIN'; access: AdminRole[] }
    | { role: 'MERCHANT'; access: MerchantRole[] };

type NavItem = {
    name: string;
    icon?: React.ReactNode;
    path?: string;
    rolesAllowed: RoleAccess[];
    subItems?: NavItem[];
};

const navItems: NavItem[] = [
    {
        icon: <GridIcon />,
        name: 'Dashboard',
        path: '/merchant',
        rolesAllowed: [
            { role: 'ADMIN', access: [] },
            { role: 'MERCHANT', access: [] }
        ]
    },
    {
        name: 'Users',
        icon: <UsersRound />,
        rolesAllowed: [
            { role: 'ADMIN', access: [] },
            { role: 'MERCHANT', access: [] }
        ],
        subItems: [
            {
                name: 'View Admin Users',
                path: '/merchant/users/admin',
                rolesAllowed: [{ role: 'ADMIN', access: ['ADMIN'] }]
            },
            {
                name: 'View Merchant Users',
                path: '/merchant/users/merchants',
                rolesAllowed: [{ role: 'ADMIN', access: [] }]
            },
            {
                name: 'View Consumer Users',
                path: '/merchant/users/consumers',
                rolesAllowed: [{ role: 'ADMIN', access: [] }]
            }
        ]
    },
    {
        name: 'Merchants',
        icon: <Building2 />,
        rolesAllowed: [{ role: 'ADMIN', access: [] }],
        subItems: [
            {
                name: 'Add Merchant',
                path: '/merchant/merchants/add',
                rolesAllowed: [{ role: 'ADMIN', access: [] }]
            },
            {
                name: 'View Merchants',
                path: '/merchant/merchants',
                rolesAllowed: [{ role: 'ADMIN', access: [] }]
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

const hasAccess = (nav: NavItem, user: User): boolean => {
    return nav.rolesAllowed.some(({ role, access }) => {
        if (!user.role.includes(role)) return false;

        // If no specific access is required, allow by role only
        if (access.length === 0) return true;

        if (role === 'ADMIN') {
            return user.adminUser?.adminRole?.some((r) => access.includes(r));
        }

        if (role === 'MERCHANT') {
            return user.merchantUser?.merchantRole?.some((r) =>
                access.includes(r)
            );
        }

        return false;
    });
};

const AppSidebar: React.FC<SessionUserProps> = ({ session, user }) => {
    const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
    const pathname = usePathname();

    const renderMenuItems = (
        navItems: NavItem[],
        menuType: 'main' | 'others'
    ) => (
        <ul className="flex flex-col gap-4">
            {navItems
                .filter((nav) => hasAccess(nav, user))
                .map((nav, index) => (
                    <li key={nav.name}>
                        {nav.subItems ? (
                            <button
                                onClick={() =>
                                    handleSubmenuToggle(index, menuType)
                                }
                                className={`menu-item group ${
                                    openSubmenu?.type === menuType &&
                                    openSubmenu?.index === index
                                        ? 'menu-item-active'
                                        : 'menu-item-inactive'
                                } cursor-pointer ${
                                    !isExpanded && !isHovered
                                        ? 'lg:justify-center'
                                        : 'lg:justify-start'
                                }`}
                            >
                                <span
                                    className={`${
                                        openSubmenu?.type === menuType &&
                                        openSubmenu?.index === index
                                            ? 'menu-item-icon-active'
                                            : 'menu-item-icon-inactive'
                                    }`}
                                >
                                    {nav.icon}
                                </span>
                                {(isExpanded || isHovered || isMobileOpen) && (
                                    <span className={`menu-item-text`}>
                                        {nav.name}
                                    </span>
                                )}
                                {(isExpanded || isHovered || isMobileOpen) && (
                                    <ChevronDownIcon
                                        className={`ml-auto h-5 w-5 transition-transform duration-200 ${
                                            openSubmenu?.type === menuType &&
                                            openSubmenu?.index === index
                                                ? 'text-brand-500 rotate-180'
                                                : ''
                                        }`}
                                    />
                                )}
                            </button>
                        ) : (
                            nav.path && (
                                <Link
                                    href={nav.path}
                                    className={`menu-item group ${
                                        isActive(nav.path)
                                            ? 'menu-item-active'
                                            : 'menu-item-inactive'
                                    }`}
                                >
                                    <span
                                        className={`${
                                            isActive(nav.path)
                                                ? 'menu-item-icon-active'
                                                : 'menu-item-icon-inactive'
                                        }`}
                                    >
                                        {nav.icon}
                                    </span>
                                    {(isExpanded ||
                                        isHovered ||
                                        isMobileOpen) && (
                                        <span className={`menu-item-text`}>
                                            {nav.name}
                                        </span>
                                    )}
                                </Link>
                            )
                        )}
                        {nav.subItems &&
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
                                            openSubmenu?.type === menuType &&
                                            openSubmenu?.index === index
                                                ? `${subMenuHeight[`${menuType}-${index}`]}px`
                                                : '0px'
                                    }}
                                >
                                    <ul className="mt-2 ml-9 space-y-1">
                                        {nav.subItems.map((subItem) => (
                                            <li key={subItem.name}>
                                                {subItem.path && (
                                                    <Link
                                                        href={subItem.path}
                                                        className={`menu-dropdown-item ${
                                                            subItem.path &&
                                                            isActive(
                                                                subItem.path
                                                            ) // Ensure path is not undefined
                                                                ? 'menu-dropdown-item-active'
                                                                : 'menu-dropdown-item-inactive'
                                                        }`}
                                                    >
                                                        {subItem.name}
                                                    </Link>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                    </li>
                ))}
        </ul>
    );

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

    useEffect(() => {
        let submenuMatched = false;
        ['main', 'others'].forEach((menuType) => {
            const items = navItems;
            items.forEach((nav, index) => {
                if (nav.subItems) {
                    nav.subItems.forEach((subItem) => {
                        // Ensure subItem.path is defined before passing it to isActive
                        if (subItem.path && isActive(subItem.path)) {
                            setOpenSubmenu({
                                type: menuType as 'main' | 'others',
                                index
                            });
                            submenuMatched = true;
                        }
                    });
                }
            });
        });

        if (!submenuMatched) {
            setOpenSubmenu(null);
        }
    }, [pathname, isActive]);

    useEffect(() => {
        if (openSubmenu !== null) {
            const key = `${openSubmenu.type}-${openSubmenu.index}`;
            if (subMenuRefs.current[key]) {
                setSubMenuHeight((prevHeights) => ({
                    ...prevHeights,
                    [key]: subMenuRefs.current[key]?.scrollHeight || 0
                }));
            }
        }
    }, [openSubmenu]);

    const handleSubmenuToggle = (
        index: number,
        menuType: 'main' | 'others'
    ) => {
        setOpenSubmenu((prevOpenSubmenu) => {
            if (
                prevOpenSubmenu &&
                prevOpenSubmenu.type === menuType &&
                prevOpenSubmenu.index === index
            ) {
                return null;
            }
            return { type: menuType, index };
        });
    };

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
                            {renderMenuItems(navItems, 'main')}
                        </div>
                    </div>
                </nav>
            </div>
        </aside>
    );
};

export default AppSidebar;
