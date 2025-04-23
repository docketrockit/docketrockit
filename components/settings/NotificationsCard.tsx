'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTransition, useState } from 'react';
import { ReloadIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';

import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import {
    UserProfileDetailsAdmin,
    verifyEmailUpdateCode,
    verifyEmailCode
} from '@/actions/auth/dashboardUser';
import { EmailSchema, VerifyEmailSchema } from '@/schemas/users';
import { Input } from '@/components/ui/input';
import FormError from '@/components/form/FormError';
import FormSuccess from '@/components/form/FormSuccess';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface UserDetailsCardProps {
    user: UserProfileDetailsAdmin | null;
}

const NotificationsCard = ({ user }: UserDetailsCardProps) => {
    const [editEmail, setEditEmail] = useState(false);
    const [verifyEmail, setVerifyEmail] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [errorCode, setErrorCode] = useState<string | undefined>();

    const [success, setSuccess] = useState<string | undefined>();
    const [isPending, startTransition] = useTransition();

    const formEmail = useForm<z.infer<typeof EmailSchema>>({
        resolver: zodResolver(EmailSchema),
        defaultValues: {
            email: user?.email || ''
        }
    });

    const formCode = useForm<z.infer<typeof VerifyEmailSchema>>({
        resolver: zodResolver(VerifyEmailSchema),
        defaultValues: {
            code: ''
        }
    });

    if (!user) return 'No user found';

    const cancel = () => {
        formEmail.reset();
        formCode.reset();
        setEditEmail(!editEmail);
        setError(undefined);
        setSuccess(undefined);
        setVerifyEmail(false);
    };

    const onSubmitEmail = (values: z.infer<typeof EmailSchema>) => {
        startTransition(async () => {
            const data = await verifyEmailUpdateCode(values);

            if (!data.result) {
                setError(data.message);
            }
            if (data?.result) {
                formEmail.reset(values);
                setVerifyEmail(true);
                setSuccess(
                    'Please check your email and enter the verification code above to confirm email change'
                );
                setError(undefined);
            }
        });
    };

    const onSubmitCode = (values: z.infer<typeof VerifyEmailSchema>) => {
        startTransition(async () => {
            const data = await verifyEmailCode(values);
            if (!data.result) {
                setErrorCode(data.message);
            }
            if (data?.result) {
                formCode.reset();
                setEditEmail(!editEmail);
                setError(undefined);
                setSuccess(undefined);
                setVerifyEmail(false);
                toast.success('Email successfully updated');
            }
        });
    };

    return (
        <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between w-full">
                <div>
                    <h4 className="text-lg font-semibold text-gray-800 lg:mb-6 dark:text-white/90">
                        Notification Settings
                    </h4>
                    <div className="flex flex-col">
                        <div className="w-full">
                            <div className="flex justify-between">
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                    Email address
                                </p>
                                <div
                                    className="cursor-pointer text-xs font-normal hover:underline"
                                    onClick={cancel}
                                >
                                    {editEmail ? 'Cancel' : 'Edit'}
                                </div>
                            </div>
                            {editEmail ? (
                                <div className="flex flex-row space-x-4">
                                    <div className="flex flex-col">
                                        <Form {...formEmail}>
                                            <form
                                                className="space-y-6 w-full"
                                                onSubmit={formEmail.handleSubmit(
                                                    onSubmitEmail
                                                )}
                                            >
                                                <div className="flex flex-row gap-x-6">
                                                    <FormField
                                                        control={
                                                            formEmail.control
                                                        }
                                                        name="email"
                                                        render={({ field }) => (
                                                            <FormItem
                                                                className={cn(
                                                                    'w-full'
                                                                )}
                                                            >
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        name="email"
                                                                        type="email"
                                                                        placeholder="Email"
                                                                        disabled={
                                                                            verifyEmail
                                                                        }
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                {error && (
                                                    <div className="flex flex-row gap-x-6">
                                                        <div className="basis-full">
                                                            <FormError
                                                                message={error}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                <div
                                                    className={`flex-1 ${verifyEmail && 'hidden'}`}
                                                >
                                                    <Button
                                                        type="submit"
                                                        disabled={
                                                            isPending ||
                                                            verifyEmail
                                                        }
                                                    >
                                                        {isPending ? (
                                                            <>
                                                                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                                                Please wait...
                                                            </>
                                                        ) : (
                                                            'Update'
                                                        )}
                                                    </Button>
                                                </div>
                                            </form>
                                        </Form>
                                    </div>
                                    {verifyEmail && (
                                        <div className="flex flex-col">
                                            <Form {...formCode}>
                                                <form
                                                    className="space-y-6 w-full"
                                                    onSubmit={formCode.handleSubmit(
                                                        onSubmitCode
                                                    )}
                                                >
                                                    <div className="flex flex-row gap-x-6">
                                                        <FormField
                                                            control={
                                                                formCode.control
                                                            }
                                                            name="code"
                                                            render={({
                                                                field
                                                            }) => (
                                                                <FormItem
                                                                    className={cn(
                                                                        'w-full'
                                                                    )}
                                                                >
                                                                    <FormControl>
                                                                        <Input
                                                                            {...field}
                                                                            name="code"
                                                                            type="text"
                                                                            placeholder="Code"
                                                                        />
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    {(success || errorCode) && (
                                                        <div className="flex flex-row gap-x-6">
                                                            <div className="basis-full">
                                                                <FormError
                                                                    message={
                                                                        errorCode
                                                                    }
                                                                />
                                                                <FormSuccess
                                                                    message={
                                                                        success
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <Button
                                                            type="submit"
                                                            disabled={isPending}
                                                        >
                                                            {isPending ? (
                                                                <>
                                                                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                                                    Please
                                                                    wait...
                                                                </>
                                                            ) : (
                                                                'Update'
                                                            )}
                                                        </Button>
                                                    </div>
                                                </form>
                                            </Form>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                    {user.email}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationsCard;
