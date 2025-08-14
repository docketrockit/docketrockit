'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    UserRound,
    Mail,
    LockKeyhole,
    SquareAsterisk,
    Briefcase
} from 'lucide-react';
import { AdminRole } from '@/generated/prisma';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from '@/components/ui/form';
import { MultiSelect } from '@/components/ui/multi-select';
import { AdminUserSchema } from '@/schemas/users';
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
import { AdminRoleLabels } from '@/types/user';
import { createAdminUser } from '@/actions/admin/adminUsers';

const AddAdminUserForm = () => {
    const [error, setError] = useState<string | undefined>('');
    const [success, setSuccess] = useState<boolean>(false);
    const [isPending, startTransition] = useTransition();

    const adminRoleOptions = Object.values(AdminRole).map((value) => ({
        value,
        label: AdminRoleLabels[value]
    }));

    const form = useForm<z.infer<typeof AdminUserSchema>>({
        resolver: zodResolver(AdminUserSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            jobTitle: '',
            adminRole: []
        }
    });

    const onGenerate = () => {
        const password = generatePassword(12);
        form.setValue('password', password);
    };

    const onSubmit = (values: z.infer<typeof AdminUserSchema>) => {
        setError('');
        setSuccess(false);
        startTransition(async () => {
            const data = await createAdminUser(values);
            // if (!data.result) {
            //     setError(data.message);
            // } else {
            //     setSuccess(true);
            // }
        });
    };

    return (
        <div className="w-1/2">
            <ComponentCard>
                {success ? (
                    <div>
                        User successfully created. An email will be sent to them
                        with all details to access their account.
                    </div>
                ) : (
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
                                                    name="access"
                                                    options={adminRoleOptions}
                                                    onValueChange={(
                                                        selectedValues
                                                    ) => {
                                                        form.setValue(
                                                            'adminRole',
                                                            selectedValues.map(
                                                                (key) =>
                                                                    key as AdminRole
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
                                <div className="flex justify-end">
                                    <SubmitButton
                                        text="Add User"
                                        isPending={isPending}
                                    />
                                </div>
                            </div>
                        </form>
                    </Form>
                )}
            </ComponentCard>
        </div>
    );
};

export default AddAdminUserForm;
