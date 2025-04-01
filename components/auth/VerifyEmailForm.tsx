'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from '@/components/ui/form';
import { FormInputAuth } from '@/components/form/FormInputAuth';
import { AuthSubmitButton } from '@/components/form/Buttons';
import { VerifyEmailSchema } from '@/schemas/auth';
import FormError from '@/components/form/FormError';
import {
    resendEmailVerificationCodeAction,
    verifyEmailAction
} from '@/actions/login';

const VerifyEmailForm = ({ email }: { email: string }) => {
    const [error, setError] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof VerifyEmailSchema>>({
        resolver: zodResolver(VerifyEmailSchema),
        defaultValues: {
            code: ''
        }
    });

    const onSubmit = (values: z.infer<typeof VerifyEmailSchema>) => {
        setError('');
        startTransition(async () => {
            const data = await verifyEmailAction(values);
            if (!data.result) {
                form.setValue('code', '');
                setError(data.message);
            }
        });
    };

    const onResendCode = () => {
        setError('');
        startTransition(async () => {
            const data = await resendEmailVerificationCodeAction();
            if (!data.result) {
                toast.error(data.message);
                setError(data.message);
            } else {
                toast.success(data.message);
                setError('');
            }
        });
    };

    return (
        <div className="flex w-full flex-1 flex-col lg:w-1/2">
            <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
                <div>
                    <div className="mb-5 sm:mb-8">
                        <h1 className="text-3xl sm:text-4xl mb-2 font-semibold text-gray-800 dark:text-white/90">
                            Verify your email address
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            We sent an 8-digit code to {email}. Please enter the
                            code below or request a new code.
                        </p>
                    </div>
                    <div>
                        <Form {...form}>
                            <div className="mb-2">
                                <FormError message={error} />
                            </div>
                            <form
                                className="space-y-6"
                                onSubmit={form.handleSubmit(onSubmit)}
                            >
                                <div className="relative">
                                    <FormField
                                        control={form.control}
                                        name="code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <FormInputAuth
                                                        {...field}
                                                        label="Code"
                                                        name="code"
                                                        type="text"
                                                        defaultValue=""
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div
                                        className="cursor-pointer text-blue-700 hover:text-blue-800 dark:text-blue-300 text-sm"
                                        onClick={onResendCode}
                                    >
                                        Resend code
                                    </div>
                                </div>
                                <div>
                                    <AuthSubmitButton
                                        text="Verify"
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

export default VerifyEmailForm;
