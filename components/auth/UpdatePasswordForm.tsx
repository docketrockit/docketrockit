'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { toast } from 'sonner';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from '@/components/ui/form';
import { PasswordInputAuth } from '@/components/form/FormInputAuth';

import { ResetPasswordSchema } from '@/schemas/auth';
import { AuthSubmitButton } from '@/components/form/Buttons';
import FormError from '@/components/form/FormError';
import { updatePasswordAction } from '@/actions/forgotPassword';

const UpdatePasswordForm = () => {
    const [error, setError] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof ResetPasswordSchema>>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: ''
        }
    });

    const onSubmit = (values: z.infer<typeof ResetPasswordSchema>) => {
        setError('');

        startTransition(async () => {
            const data = await updatePasswordAction(values);
            if (!data.result) {
                toast.error(data.message);
            }
        });
    };

    return (
        <div className="flex w-full flex-1 flex-col lg:w-1/2">
            <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
                <div>
                    <div className="mb-5 sm:mb-8">
                        <h1 className="text-3xl sm:text-4xl mb-2 font-semibold text-gray-800 dark:text-white/90">
                            Reset Password
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Use the form below to reset your password.
                        </p>
                    </div>
                    <div>
                        <Form {...form}>
                            <FormError message={error} />
                            <form
                                className="space-y-6"
                                onSubmit={form.handleSubmit(onSubmit)}
                            >
                                <div className="relative">
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <PasswordInputAuth
                                                        {...field}
                                                        label="Password"
                                                        name="password"
                                                        type="password"
                                                        defaultValue=""
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="relative">
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <PasswordInputAuth
                                                        {...field}
                                                        label="Confirm Password"
                                                        name="confirmPassword"
                                                        type="password"
                                                        defaultValue=""
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div>
                                    <AuthSubmitButton
                                        text="Reset Password"
                                        isPending={isPending}
                                    />
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdatePasswordForm;
