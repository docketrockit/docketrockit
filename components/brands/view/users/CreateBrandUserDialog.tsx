'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition, useEffect } from 'react';
import { PlusIcon, ReloadIcon } from '@radix-ui/react-icons';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from '@/components/ui/drawer';

import { createMerchantUser } from '@/actions/admin/merchantUsers';
import { MerchantUserSchema } from '@/schemas/users';
import { CreateMerchantUserForm } from './CreateMerchantUserForm';

export const CreateMerchantUserDialog = ({
    merchantId,
    merchantSlug
}: {
    merchantId: string;
    merchantSlug: string;
}) => {
    const [open, setOpen] = useState(false);
    const [isCreatePending, startCreateTransition] = useTransition();
    const isDesktop = useMediaQuery('(min-width: 640px)');

    const form = useForm<z.infer<typeof MerchantUserSchema>>({
        resolver: zodResolver(MerchantUserSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            jobTitle: '',
            phoneNumber: '',
            merchantRole: [],
            primaryContact: false
        }
    });

    function onSubmit(input: z.infer<typeof MerchantUserSchema>) {
        startCreateTransition(async () => {
            const { error } = await createMerchantUser(
                input,
                'merchant',
                merchantId,
                merchantSlug
            );

            if (error) {
                toast.error(error);
                return;
            }

            form.reset();
            setOpen(false);
            toast.success('User created');
        });
    }

    if (isDesktop)
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <PlusIcon className="mr-2 size-4" aria-hidden="true" />
                        New user
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Admin User</DialogTitle>
                        <DialogDescription>
                            Fill in the form below to create a new admin user.
                        </DialogDescription>
                    </DialogHeader>
                    <CreateMerchantUserForm form={form} onSubmit={onSubmit}>
                        <DialogFooter className="gap-2 pt-2 sm:space-x-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    form.reset();
                                    setOpen(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button disabled={isCreatePending}>
                                {isCreatePending && (
                                    <ReloadIcon
                                        className="mr-2 size-4 animate-spin"
                                        aria-hidden="true"
                                    />
                                )}
                                Create
                            </Button>
                        </DialogFooter>
                    </CreateMerchantUserForm>
                </DialogContent>
            </Dialog>
        );

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button variant="outline" size="sm">
                    <PlusIcon className="mr-2 size-4" aria-hidden="true" />
                    New user
                </Button>
            </DrawerTrigger>

            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Create Admin User</DrawerTitle>
                    <DrawerDescription>
                        Fill in the form below to create a new admin user.
                    </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter className="gap-2 sm:space-x-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            form.reset();
                            setOpen(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={isCreatePending}
                        onClick={() => {
                            form.reset();
                            setOpen(false);
                        }}
                    >
                        {isCreatePending && (
                            <ReloadIcon
                                className="mr-2 size-4 animate-spin"
                                aria-hidden="true"
                            />
                        )}
                        Create
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};
