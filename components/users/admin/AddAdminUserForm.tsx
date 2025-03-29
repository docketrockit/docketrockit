'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UserRound, Mail, LockKeyhole, SquareAsterisk } from 'lucide-react';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from '@/components/ui/form';
import { MultiSelect } from '@/components/ui/multi-select';
import { AdminUserSchema } from '@/schemas/users';
import { authClient } from '@/lib/auth-client';
import FormError from '@/components/form/FormError';
import ComponentCard from '@/components/common/ComponentCard';
import generatePassword from '@/utils/generatePassword';
import { cn } from '@/lib/utils';
import {
    FormInputIcon,
    FormInputIconPassword
} from '@/components/form/FormInputs';
import { Button } from '@/components/ui/button';
import { SubmitButton } from '@/components/form/Buttons';
import { AdminRole } from '@/types/user';

const AddAdminUserForm = () => {
    const router = useRouter();
    const [error, setError] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();

    const roles = Object.entries(AdminRole).map(([key, value]) => ({
        value: key,
        label: value
    }));

    const form = useForm<z.infer<typeof AdminUserSchema>>({
        resolver: zodResolver(AdminUserSchema),
        defaultValues: {
            name: '',
            lastName: '',
            email: '',
            password: '',
            access: []
        }
    });

    const onGenerate = () => {
        const password = generatePassword(12);
        form.setValue('password', password);
    };

    const onSubmit = (values: z.infer<typeof AdminUserSchema>) => {
        setError('');
        startTransition(async () => {
            // const { error } = await authClient.signIn.email({
            //     email: values.email,
            //     password: values.password,
            //     rememberMe: values.rememberMe
            // });
            // if (error) {
            //     toast.error(error.message);
            // } else {
            //     router.push('/merchant/');
            //     router.refresh();
            // }
            console.log(values);
        });
    };

    return (
        <div className="w-1/2">
            <ComponentCard>
                <Form {...form}>
                    <FormError message={error} />
                    <form
                        className="space-y-6"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <div className="flex flex-col space-y-6">
                            <div className="flex flex-row space-x-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className={cn('w-full')}>
                                            <FormControl>
                                                <FormInputIcon
                                                    {...field}
                                                    name="name"
                                                    type="text"
                                                    icon={UserRound}
                                                    label="First Name"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem className={cn('w-full')}>
                                            <FormControl>
                                                <FormInputIcon
                                                    {...field}
                                                    name="lastName"
                                                    type="text"
                                                    icon={UserRound}
                                                    label="Last Name"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className={cn('w-full')}>
                                        <FormControl>
                                            <FormInputIcon
                                                {...field}
                                                name="email"
                                                type="email"
                                                icon={Mail}
                                                label="Email"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex flex-row space-x-6">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className={cn('w-full')}>
                                            <FormControl>
                                                <FormInputIconPassword
                                                    {...field}
                                                    name="password"
                                                    type="password"
                                                    icon={LockKeyhole}
                                                    label="Password"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="button" onClick={onGenerate}>
                                    <SquareAsterisk /> Generate
                                </Button>
                            </div>
                            <FormField
                                control={form.control}
                                name="access"
                                render={({ field }) => (
                                    <FormItem className={cn('w-full')}>
                                        <FormControl>
                                            <MultiSelect
                                                {...field}
                                                name="access"
                                                options={roles}
                                                onValueChange={(
                                                    selectedValues
                                                ) => {
                                                    form.setValue(
                                                        'access',
                                                        selectedValues.map(
                                                            (key) =>
                                                                key as AdminRole
                                                        )
                                                    );
                                                }}
                                                placeholder="Select frameworks"
                                                variant="secondary"
                                                animation={2}
                                                maxCount={999}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end">
                                <SubmitButton
                                    text="Add User"
                                    isPending={isPending}
                                />
                            </div>
                        </div>
                    </form>
                </Form>
            </ComponentCard>
        </div>
    );
};

export default AddAdminUserForm;
