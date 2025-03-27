import './globals.css';
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
                {children}
                <Toaster richColors />
            </body>
        </html>
    );
}
