'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Link from 'next/link';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from '@/components/ui/form';
import { FormInputAuth } from '@/components/form/FormInputAuth';
import { AuthSubmitButton } from '@/components/form/Buttons';
import { RecoveryCodeSchema } from '@/schemas/auth';
import FormError from '@/components/form/FormError';
import { verifyRecoveryCode } from '@/actions/login';

const TwoFactorRecoveryCodeForm = () => {
    const [error, setError] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof RecoveryCodeSchema>>({
        resolver: zodResolver(RecoveryCodeSchema),
        defaultValues: {
            code: ''
        }
    });

    const onSubmit = (values: z.infer<typeof RecoveryCodeSchema>) => {
        setError('');
        startTransition(async () => {
            const data = await verifyRecoveryCode(values);
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
                        <h1 className="text-3xl sm:text-4xl mb-2 font-semibold text-gray-800 dark:text-white/90">
                            Use one of your recovery codes
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            If you&apos;ve lost your two factor authentication,
                            use one of your revovery codes ot login. If you
                            can&apos;t find any of them, please contact us at{' '}
                            <a href="mailto:help@docketrockit.com">
                                help@docketrockit.com
                            </a>
                            . Using a recovery code will remove it from our
                            system. Once you have verified your recovery code,
                            you will need to re-setup two factor authentication.
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
                                    <Link
                                        href="/merchant/twofactor"
                                        className="cursor-pointer text-blue-700 hover:text-blue-800 dark:text-blue-300 text-sm"
                                    >
                                        Found app?
                                    </Link>
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
export default TwoFactorRecoveryCodeForm;
