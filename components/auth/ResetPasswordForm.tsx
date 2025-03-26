'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from '@/components/ui/form';
import { FormInputAuth } from '@/components/form/FormInputAuth';
import { toast } from 'sonner';

import { ResetPasswordSchema } from '@/schemas/auth';
import { authClient } from '@/lib/auth-client';
import { AuthSubmitButton } from '@/components/form/Buttons';
import FormError from '@/components/form/FormError';
import FormSuccess from '@/components/form/FormSuccess';

export interface ResetPasswordFormProps {
    token: string | undefined;
    tokenError: string | null;
}

const ResetPasswordForm = ({ token, tokenError }: ResetPasswordFormProps) => {
    const router = useRouter();
    const [error, setError] = useState<string | undefined>('');
    const [success, setSuccess] = useState<string | undefined>('');
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
        setSuccess('');

        startTransition(async () => {
            const { error } = await authClient.forgetPassword({
                email: values.password,
                redirectTo: '/reset-password'
            });
            if (error) {
                toast.error(error.message);
            } else {
                toast.success('Password reset');
                setSuccess(
                    'If an account exists with this email, you will receive a password reset link.'
                );
            }
        });
    };

    if (tokenError) {
        return (
            <div className="flex w-full flex-1 flex-col lg:w-1/2">
                <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
                    <div>
                        <div className="mb-5 sm:mb-8">
                            <h1 className="text-3xl sm:text-4xl mb-2 font-semibold text-gray-800 dark:text-white/90">
                                Forgot Your Password?
                            </h1>
                            {/* <p className="text-sm text-gray-500 dark:text-gray-400">
                                Enter the email address linked to your account,
                                and we’ll send you a link to reset your
                                password.
                            </p> */}
                        </div>
                        <div>
                            <FormError message={tokenError} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-full flex-1 flex-col lg:w-1/2">
            <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
                <div>
                    <div className="mb-5 sm:mb-8">
                        <h1 className="text-3xl sm:text-4xl mb-2 font-semibold text-gray-800 dark:text-white/90">
                            Forgot Your Password?
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Enter the email address linked to your account, and
                            we’ll send you a link to reset your password.
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
                                </form>
                            </Form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordForm;
