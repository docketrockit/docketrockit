import type { Metadata } from 'next';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
    title: {
        template: `DocketRockit | Merchant Admin | %s`,
        default: `DocketRockit | Merchant Admin` // a default is required when creating a template
    }
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ThemeProvider>
            <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
    );
}
