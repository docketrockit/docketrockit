'use client';

import { Moon, Sun } from 'lucide-react';

import { useTheme } from '@/context/ThemeContext';

export default function ThemeTogglerTwo() {
    const { toggleTheme } = useTheme();
    return (
        <button
            onClick={toggleTheme}
            className="inline-flex size-14 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600 cursor-pointer"
        >
            <Sun className="hidden dark:block" />
            <Moon className="dark:hidden" />
        </button>
    );
}
