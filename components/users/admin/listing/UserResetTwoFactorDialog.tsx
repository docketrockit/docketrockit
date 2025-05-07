'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { ReloadIcon } from '@radix-ui/react-icons';

import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { UserResetPasswordDialogProps } from '@/types/global';
import { resetUserTwoFactor } from '@/actions/auth/dashboardUser';
import { cn } from '@/lib/utils';

const UserResetTwoFactorDialog = ({
    user,
    isOpen,
    onOpenChange
}: UserResetPasswordDialogProps) => {
    const [isPending, startTransition] = useTransition();

    function onClick() {
        startTransition(async () => {
            const data = await resetUserTwoFactor(user.id);

            if (!data.result) {
                toast.error(data.message);
                return;
            }
            toast.success('User two factor reset');
            onOpenChange?.(false);
        });
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {`Are you sure you wish to reset ${user.firstName} ${user.lastName}'s two factor authentication?`}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. The user will receive a
                        notification of their two factor authentication reset.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>
                        <Button
                            type="button"
                            disabled={isPending}
                            className={cn('w-20')}
                            onClick={onClick}
                        >
                            {isPending ? (
                                <>
                                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                    Please wait...
                                </>
                            ) : (
                                'Reset'
                            )}
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
export default UserResetTwoFactorDialog;
