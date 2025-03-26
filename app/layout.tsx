import './globals.css';
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { outfit } from './fonts';
import { Toaster } from '@/components/ui/sonner';

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${outfit.className}`}>
                <ThemeProvider>
                    <SidebarProvider>{children}</SidebarProvider>
                </ThemeProvider>
                <Toaster richColors />
            </body>
        </html>
    );
}
