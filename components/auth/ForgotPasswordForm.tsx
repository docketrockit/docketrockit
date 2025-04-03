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
import { FormInputAuth } from '@/components/form/FormInputAuth';

import { ForgotPasswordSchema } from '@/schemas/auth';
import { AuthSubmitButton } from '@/components/form/Buttons';
import FormError from '@/components/form/FormError';
import { forgotPasswordAction } from '@/actions/forgotPassword';
import FormSuccess from '@/components/form/FormSuccess';

const ForgotPasswordForm = () => {
    const [error, setError] = useState<string | undefined>('');
    const [success, setSuccess] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: {
            email: ''
        }
    });

    const onSubmit = (values: z.infer<typeof ForgotPasswordSchema>) => {
        setError('');
        setSuccess('');

        startTransition(async () => {
            const data = await forgotPasswordAction(values);
            if (!data.result) {
                toast.error(data.message);
            } else {
                setSuccess(
                    'If an account exists with this email, you will receive a password reset link.'
                );
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
                            Enter your new password below to reset your
                            password.
                        </p>
                    </div>
                    <div>
                        {success ? (
                            <FormSuccess message={success} />
                        ) : (
                            <Form {...form}>
                                <FormError message={error} />
                                <form
                                    className="space-y-6"
                                    onSubmit={form.handleSubmit(onSubmit)}
                                >
                                    <div className="relative">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <FormInputAuth
                                                            {...field}
                                                            label="Email"
                                                            name="email"
                                                            type="text"
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
                                    <Link
                                        href="/merchant/login"
                                        className="text-blue-700 hover:text-blue-800 dark:text-blue-300 text-sm"
                                    >
                                        Back to login
                                    </Link>
                                </form>
                            </Form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordForm;
