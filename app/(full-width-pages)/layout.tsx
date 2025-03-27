import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';

export default function FullWidthPageLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <ThemeProvider>
                <SidebarProvider>{children}</SidebarProvider>
            </ThemeProvider>
        </div>
    );
}
