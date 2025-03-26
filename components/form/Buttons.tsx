'use client';

import { ReloadIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type btnSize = 'default' | 'lg' | 'sm';

type SubmitButtonProps = {
    className?: string;
    text?: string;
    size?: btnSize;
    isPending: boolean;
    disabledCheck?: boolean;
};

export const AuthSubmitButton = ({
    className = '',
    text = 'submit',
    size = 'lg',
    isPending
}: SubmitButtonProps) => {
    return (
        <Button
            type="submit"
            disabled={isPending}
            className={cn(
                "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive text-primary-foreground shadow-xs px-4 py-2 has-[>svg]:px-3 bg-blue-700 w-full h-11 hover:bg-blue-800 cursor-pointer dark:text-white",
                className
            )}
            size={size}
        >
            {isPending ? (
                <>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    Please wait...
                </>
            ) : (
                text
            )}
        </Button>
    );
};
