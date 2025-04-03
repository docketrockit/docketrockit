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
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    PasswordInputAuth,
    FormInputAuth
} from '@/components/form/FormInputAuth';
import { AuthSubmitButton } from '@/components/form/Buttons';
import { LoginSchema } from '@/schemas/auth';
import FormError from '@/components/form/FormError';
import { login } from '@/actions/login';

const LoginForm = () => {
    const [error, setError] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: '',
            rememberMe: true
        }
    });

    const onSubmit = (values: z.infer<typeof LoginSchema>) => {
        setError('');
        startTransition(async () => {
            const data = await login(values);
            if (!data.result) {
                form.setValue('password', '');
                toast.error(data.message);
                setError(data.message);
            }
        });
    };

    // useEffect(() => {
    //     console.log('Form errors:', form.formState.errors);
    // }, [form.formState.errors]);

    return (
        <div className="flex w-full flex-1 flex-col lg:w-1/2">
            <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
                <div>
                    <div className="mb-5 sm:mb-8">
                        <h1 className="text-3xl sm:text-4xl mb-2 font-semibold text-gray-800 dark:text-white/90">
                            Sign In
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Enter your email and password to sign in!
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
                                <div className="flex items-center justify-between">
                                    <div className="items-center flex space-x-2">
                                        <FormField
                                            control={form.control}
                                            name="rememberMe"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center space-x-2">
                                                    <FormControl>
                                                        <Checkbox
                                                            className="size-5"
                                                            checked={
                                                                field.value
                                                            }
                                                            onCheckedChange={(
                                                                checked
                                                            ) =>
                                                                field.onChange(
                                                                    checked ===
                                                                        true
                                                                )
                                                            }
                                                        />
                                                    </FormControl>
                                                    <Label className="text-sm font-normal block text-gray-700 dark:text-gray-400">
                                                        Remember Me
                                                    </Label>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <Link
                                        href="/merchant/forgot-password"
                                        className="text-blue-700 hover:text-blue-800 dark:text-blue-300 text-sm"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div>
                                    <AuthSubmitButton
                                        text="Login"
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

export default LoginForm;
