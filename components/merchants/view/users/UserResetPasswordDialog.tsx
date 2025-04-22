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
import { resetUserPassword } from '@/actions/user';
import { cn } from '@/lib/utils';

const UserResetPasswordDialog = ({
    user,
    isOpen,
    onOpenChange
}: UserResetPasswordDialogProps) => {
    const [isPending, startTransition] = useTransition();

    function onClick() {
        startTransition(async () => {
            const data = await resetUserPassword(user.id);

            if (!data.result) {
                toast.error(data.message);
                return;
            }
            toast.success('User password reset');
            onOpenChange?.(false);
        });
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {`Are you sure you wish to reset ${user.firstName} ${user.lastName}'s password?`}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. The user will receive a
                        notification of their password reset.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
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
export default UserResetPasswordDialog;
