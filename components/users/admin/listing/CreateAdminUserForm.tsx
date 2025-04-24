'use client';

import * as z from 'zod';
import { type UseFormReturn } from 'react-hook-form';
import { useEffect } from 'react';
import { AdminRole } from '@prisma/client';
import {
    UserRound,
    Mail,
    LockKeyhole,
    SquareAsterisk,
    Briefcase
} from 'lucide-react';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from '@/components/ui/form';
import {
    FormInputIcon,
    FormInputIconPassword
} from '@/components/form/FormInputs';
import { MultiSelect } from '@/components/ui/multi-select';
import { AdminRoleLabels } from '@/types/user';
import { AdminUserSchema } from '@/schemas/users';
import { Button } from '@/components/ui/button';
import generatePassword from '@/utils/generatePassword';
import { cn } from '@/lib/utils';

interface CreateTypeFormProps
    extends Omit<React.ComponentPropsWithRef<'form'>, 'onSubmit'> {
    children: React.ReactNode;
    form: UseFormReturn<z.infer<typeof AdminUserSchema>>;
    onSubmit: (data: z.infer<typeof AdminUserSchema>) => void;
}

export const CreateAdminUserForm = ({
    form,
    onSubmit,
    children
}: CreateTypeFormProps) => {
    const adminRoleOptions = Object.values(AdminRole).map((value) => ({
        value,
        label: AdminRoleLabels[value]
    }));
    const onGenerate = () => {
        const password = generatePassword(12);
        form.setValue('password', password);
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
            >
                <div className="flex flex-row space-x-6">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem className={cn('w-full')}>
                                <FormControl>
                                    <FormInputIcon
                                        {...field}
                                        name="firstName"
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
                    name="jobTitle"
                    render={({ field }) => (
                        <FormItem className={cn('w-full')}>
                            <FormControl>
                                <FormInputIcon
                                    {...field}
                                    name="jobTitle"
                                    type="text"
                                    icon={Briefcase}
                                    label="Job Title"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="adminRole"
                    render={({ field }) => (
                        <FormItem className={cn('w-full')}>
                            <FormControl>
                                <MultiSelect
                                    {...field}
                                    name="adminRole"
                                    options={adminRoleOptions}
                                    onValueChange={(selectedValues) => {
                                        form.setValue(
                                            'adminRole',
                                            selectedValues.map(
                                                (key) => key as AdminRole
                                            )
                                        );
                                    }}
                                    placeholder="Select roles"
                                    variant="secondary"
                                    animation={2}
                                    maxCount={999}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {children}
            </form>
        </Form>
    );
};
