'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from '@/components/ui/form';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
    InputOTPSeparator
} from '@/components/ui/input-otp';
import { AuthSubmitButton } from '@/components/form/Buttons';
import { TwoFactorVerficationSchema } from '@/schemas/auth';
import FormError from '@/components/form/FormError';
import { verifyTwoFactorAction } from '@/actions/auth/login';
import Link from 'next/link';

export interface TwoFactorVerificationFormProps {
    encodedTOTPKey: string;
    qrcode: string;
    userId: string;
}

const TwoFactorVerificationForm = () => {
    const [error, setError] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof TwoFactorVerficationSchema>>({
        resolver: zodResolver(TwoFactorVerficationSchema),
        defaultValues: {
            code: ''
        }
    });

    const onSubmit = (values: z.infer<typeof TwoFactorVerficationSchema>) => {
        setError('');
        startTransition(async () => {
            const data = await verifyTwoFactorAction(values);
            if (!data.result) {
                form.setValue('code', '');
                setError(data.message);
            }
        });
    };

    return (
        <div className="flex w-full flex-1 flex-col lg:w-1/2">
            <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
                <div>
                    <div className="mb-5 sm:mb-8">
                        <h1 className="text-3xl sm:text-4xl mb-2 font-semibold text-gray-800 dark:text-white/90 text-center">
                            Two-factor authentication
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Enter your code from your authenticator app
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
                                <div className="relative items-center flex justify-center">
                                    <FormField
                                        control={form.control}
                                        name="code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <InputOTP
                                                        maxLength={6}
                                                        {...field}
                                                    >
                                                        <InputOTPGroup>
                                                            <InputOTPSlot
                                                                index={0}
                                                            />
                                                            <InputOTPSlot
                                                                index={1}
                                                            />
                                                            <InputOTPSlot
                                                                index={2}
                                                            />
                                                        </InputOTPGroup>
                                                        <InputOTPSeparator />
                                                        <InputOTPGroup>
                                                            <InputOTPSlot
                                                                index={3}
                                                            />
                                                            <InputOTPSlot
                                                                index={4}
                                                            />
                                                            <InputOTPSlot
                                                                index={5}
                                                            />
                                                        </InputOTPGroup>
                                                    </InputOTP>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
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
                    <div className="mt-3">
                        <Link
                            href="/auth/twofactor/recovery"
                            className="cursor-pointer text-blue-700 hover:text-blue-800 dark:text-blue-300 text-sm"
                        >
                            Use recovery code
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TwoFactorVerificationForm;
