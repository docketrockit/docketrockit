'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitErrorHandler } from 'react-hook-form';
import { useTransition, useState, useEffect } from 'react';
import { toast } from 'sonner';

import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';

import { SubmitButton } from '@/components/form/Buttons';
import { FormInput } from '@/components/form/FormInputs';
import FormError from '@/components/form/FormError';
import { UpdatePasswordSchema } from '@/schemas/security';
import { cn } from '@/lib/utils';
import { useSession, authClient } from '@/lib/auth-client';
import { SessionProps } from '@/types/session';
import { sendPasswordResetNotificationEmail } from '@/lib/mail';
import { logPasswordChanged } from '@/actions/audit/audit-security';

const PasswordForm = ({ userSession }: SessionProps) => {
    const { refetch } = useSession();
    const [edit, setEdit] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof UpdatePasswordSchema>>({
        resolver: zodResolver(UpdatePasswordSchema),
        defaultValues: {
            currentPassword: '',
            password: '',
            confirmPassword: ''
        }
    });

    const cancel = () => {
        form.reset();
        setEdit(!edit);
        setError(undefined);
    };

    const onSubmit = (values: z.infer<typeof UpdatePasswordSchema>) => {
        startTransition(async () => {
            await authClient.changePassword({
                newPassword: values.password,
                currentPassword: values.currentPassword,
                revokeOtherSessions: true,
                fetchOptions: {
                    onError: (ctx) => {
                        toast.dismiss();
                        toast.error('Current password is incorrect');
                    },
                    onSuccess: async () => {
                        if (userSession && userSession.user) {
                            await sendPasswordResetNotificationEmail({
                                email: userSession.user.email
                            });
                            await logPasswordChanged(userSession.user.id);
                        }
                        toast.dismiss();
                        refetch();
                        setEdit(false);
                        toast.success('Password successfully updated');
                        form.reset(values);
                        // Create password change email
                        // Create audit log - for all actions
                    }
                }
            });
        });
    };

    const onError: SubmitErrorHandler<z.infer<typeof UpdatePasswordSchema>> = (
        errors
    ) => {
        const errorMessages = Object.entries(errors).map(([field, error]) => (
            <li key={field}>{error.message || `Invalid ${field}`}</li>
        ));

        toast.dismiss();

        toast.error('Please fix the following errors:', {
            description: (
                <ul className="list-disc ml-4 space-y-1">{errorMessages}</ul>
            ),
            closeButton: true,
            duration: Infinity
        });
    };

    return (
        <div className=" pb-8 mt-8">
            <div className="w-full md:w-3/5 flex flex-col gap-5">
                <div className="flex justify-between">
                    <h3 className="font-semibold text-base">Password</h3>
                    <div
                        className="cursor-pointer text-base font-normal hover:underline"
                        onClick={cancel}
                    >
                        {edit ? 'Cancel' : 'Edit'}
                    </div>
                </div>
                {edit && (
                    <Form {...form}>
                        <form
                            className="space-y-6 w-full"
                            onSubmit={form.handleSubmit(onSubmit, onError)}
                        >
                            <div className="flex flex-col gap-x-6">
                                <FormField
                                    control={form.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                        <FormItem className={cn('w-full mb-5')}>
                                            <FormControl>
                                                <FormInput
                                                    {...field}
                                                    name="currentPassword"
                                                    type="password"
                                                    placeholder="Current Password"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className={cn('w-full mb-5')}>
                                            <FormControl>
                                                <FormInput
                                                    {...field}
                                                    name="password"
                                                    type="password"
                                                    placeholder="New Password"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem className={cn('w-full')}>
                                            <FormControl>
                                                <FormInput
                                                    {...field}
                                                    name="confirmPassword"
                                                    type="password"
                                                    placeholder="Confirm Password"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            {error && (
                                <div className="flex flex-row gap-x-6">
                                    <div className="basis-full">
                                        <FormError message={error} />
                                    </div>
                                </div>
                            )}
                            <div className="flex-1">
                                <SubmitButton
                                    text="Update"
                                    isPending={isPending}
                                />
                            </div>
                        </form>
                    </Form>
                )}
            </div>
        </div>
    );
};
export default PasswordForm;
