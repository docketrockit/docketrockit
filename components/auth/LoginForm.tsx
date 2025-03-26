'use client';

import { EyeClosed, EyeIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

const LoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
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
                        <form action="/">
                            <div className="flex flex-col space-y-6">
                                <div>
                                    <Label
                                        htmlFor="email"
                                        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                                    >
                                        Email{' '}
                                        <span className="text-red-700">*</span>
                                    </Label>
                                    <Input
                                        placeholder="info@gmail.com"
                                        type="email"
                                        name="email"
                                        className={cn('h-11')}
                                    />
                                </div>
                                <div>
                                    <Label
                                        htmlFor="password"
                                        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                                    >
                                        Password{' '}
                                        <span className="text-red-700">
                                            *
                                        </span>{' '}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            className={cn('h-11')}
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            placeholder="Enter your password"
                                        />
                                        <span
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute top-1/2 right-4 z-30 -translate-y-1/2 cursor-pointer"
                                        >
                                            {showPassword ? (
                                                <EyeIcon />
                                            ) : (
                                                <EyeClosed />
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="items-center flex space-x-2">
                                        <Checkbox
                                            id="rememberme"
                                            className="size-5"
                                        />
                                        <div className="grid gap-1.5 ">
                                            <label
                                                htmlFor="rememberme"
                                                className="text-sm font-normal block text-gray-700 dark:text-gray-400"
                                            >
                                                Keep me logged in
                                            </label>
                                        </div>
                                    </div>
                                    <Link
                                        href="/merchant/forgot-password"
                                        className="text-blue-700 hover:text-blue-800 dark:text-blue-300 text-sm"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div>
                                    <Button className="bg-blue-700 w-full h-11 hover:bg-blue-800 cursor-pointer dark:text-white">
                                        Sign in
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
