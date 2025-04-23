'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useTransition, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ReloadIcon } from '@radix-ui/react-icons';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
    FormLabel
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { UserProfileSchema } from '@/schemas/users';
import {
    UserProfileDetailsAdmin,
    updateUserProfileAdmin
} from '@/actions/auth/dashboardUser';
import FormError from '@/components/form/FormError';
import PostcodeSearch from './PostcodeSearch';
import { cn } from '@/lib/utils';

interface EditProfileModelProps {
    isOpen: boolean;
    closeModal: () => void;
    user: UserProfileDetailsAdmin;
}

const EditProfileModal = ({
    isOpen,
    closeModal,
    user
}: EditProfileModelProps) => {
    const [error, setError] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof UserProfileSchema>>({
        resolver: zodResolver(UserProfileSchema),
        defaultValues: {
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber || '',
            jobTitle: user.adminUser
                ? user.adminUser.jobTitle
                : user.merchantUser?.jobTitle,
            city: user.city?.toUpperCase() || '',
            state: user.state?.isoCode || '',
            postcode: user.postcode || ''
        }
    });

    const onSubmit = (values: z.infer<typeof UserProfileSchema>) => {
        setError('');
        startTransition(async () => {
            const data = await updateUserProfileAdmin(values);
            if (!data.result) {
                toast.error(data.message);
                setError(data.message);
            } else {
                closeModal();
                toast.success(data.message);
            }
        });
    };

    // useEffect(() => {
    //     console.log('Form errors:', form.formState.errors);
    // }, [form.formState.errors]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={closeModal}
            className="m-4 max-w-[700px]"
        >
            <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
                <div className="px-2 pr-14">
                    <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                        Edit User
                    </h4>
                </div>
                <Form {...form}>
                    <FormError message={error} />
                    <form
                        className="flex flex-col"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                            <div className="mt-7">
                                <h5 className="mb-5 text-lg font-medium text-gray-800 lg:mb-6 dark:text-white/90">
                                    Personal Information
                                </h5>

                                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                    <div className="col-span-2 lg:col-span-1">
                                        <FormField
                                            control={form.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        First Name
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="col-span-2 lg:col-span-1">
                                        <FormField
                                            control={form.control}
                                            name="lastName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Last Name
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="col-span-2 lg:col-span-1">
                                        <FormField
                                            control={form.control}
                                            name="phoneNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Phone Number
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="col-span-2 lg:col-span-1">
                                        <FormField
                                            control={form.control}
                                            name="jobTitle"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Job Title
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-2 lg:col-span-1">
                                        <Label className={cn('mb-2')}>
                                            Location
                                        </Label>
                                        <PostcodeSearch />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={closeModal}
                            >
                                Close
                            </Button>
                            <Button
                                size="sm"
                                type="submit"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                        Please wait...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </Modal>
    );
};
export default EditProfileModal;
