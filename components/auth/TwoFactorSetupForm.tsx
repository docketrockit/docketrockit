'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Role } from '@/generated/prisma';

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
import { TwoFactorSetupSchema } from '@/schemas/auth';
import FormError from '@/components/form/FormError';
import { setupTwoFactorAction } from '@/actions/auth/login';
import { resetUserRecoveryCode } from '@/lib/user';
import Link from 'next/link';

export interface TwoFactorSetupFormProps {
    encodedTOTPKey: string;
    qrcode: string;
    userId: string;
    role: Role[];
}

const TwoFactorSetupForm = ({
    encodedTOTPKey,
    qrcode,
    userId,
    role
}: TwoFactorSetupFormProps) => {
    const [error, setError] = useState<string | undefined>('');
    const [success, setSuccess] = useState<boolean>(false);
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof TwoFactorSetupSchema>>({
        resolver: zodResolver(TwoFactorSetupSchema),
        defaultValues: {
            code: '',
            encodedKey: encodedTOTPKey
        }
    });

    const onSubmit = (values: z.infer<typeof TwoFactorSetupSchema>) => {
        setError('');
        startTransition(async () => {
            const data = await setupTwoFactorAction(values);
            if (!data.result) {
                form.setValue('code', '');
                setError(data.message);
            } else {
                const codes = await resetUserRecoveryCode(userId);
                setRecoveryCodes(codes);
                setSuccess(true);
            }
        });
    };

    return (
        <div className="flex w-full flex-1 flex-col lg:w-1/2">
            <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
                <div>
                    <div className="mb-5 sm:mb-8">
                        <h1 className="text-3xl sm:text-4xl mb-2 font-semibold text-gray-800 dark:text-white/90 text-center">
                            Set up two-factor authentication
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {!success
                                ? 'Scan the QRCode below and enter the verification code to finish setup'
                                : 'Save your recovery codes below in case you lose your authentication software. You will not be able to access these again. These have been reset if you are setting up two factor authentication again.'}
                        </p>
                    </div>
                    {!success ? (
                        <>
                            <div className="mb-5 sm:mb-8 items-center justify-center flex">
                                <div
                                    style={{
                                        width: '200px',
                                        height: '200px'
                                    }}
                                    dangerouslySetInnerHTML={{
                                        __html: qrcode
                                    }}
                                ></div>
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
                                                                        index={
                                                                            0
                                                                        }
                                                                    />
                                                                    <InputOTPSlot
                                                                        index={
                                                                            1
                                                                        }
                                                                    />
                                                                    <InputOTPSlot
                                                                        index={
                                                                            2
                                                                        }
                                                                    />
                                                                </InputOTPGroup>
                                                                <InputOTPSeparator />
                                                                <InputOTPGroup>
                                                                    <InputOTPSlot
                                                                        index={
                                                                            3
                                                                        }
                                                                    />
                                                                    <InputOTPSlot
                                                                        index={
                                                                            4
                                                                        }
                                                                    />
                                                                    <InputOTPSlot
                                                                        index={
                                                                            5
                                                                        }
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
                        </>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 mb-10">
                                {recoveryCodes.map((code, index) => {
                                    return <div key={index}>{code}</div>;
                                })}
                            </div>
                            <div className="flex items-center justify-between">
                                <Link
                                    href={
                                        role.includes('ADMIN')
                                            ? '/admin'
                                            : '/merchant'
                                    }
                                    className="cursor-pointer text-blue-700 hover:text-blue-800 dark:text-blue-300 text-sm"
                                >
                                    Dashboard
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TwoFactorSetupForm;
