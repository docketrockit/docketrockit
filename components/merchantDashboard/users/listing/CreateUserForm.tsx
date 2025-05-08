'use client';

import * as z from 'zod';
import { type UseFormReturn } from 'react-hook-form';
import { MerchantRole } from '@prisma/client';
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
import { MerchantRoleLabels } from '@/types/user';
import { MerchantUserSchema } from '@/schemas/merchant/users';
import { Button } from '@/components/ui/button';
import generatePassword from '@/utils/generatePassword';
import { cn } from '@/lib/utils';
import { PhoneInput } from '@/components/ui/phone-input';

interface CreateTypeFormProps
    extends Omit<React.ComponentPropsWithRef<'form'>, 'onSubmit'> {
    children: React.ReactNode;
    form: UseFormReturn<z.infer<typeof MerchantUserSchema>>;
    onSubmit: (data: z.infer<typeof MerchantUserSchema>) => void;
}

export const CreateUserForm = ({
    form,
    onSubmit,
    children
}: CreateTypeFormProps) => {
    const merchantRoleOptions = Object.values(MerchantRole).map((value) => ({
        value,
        label: MerchantRoleLabels[value]
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
                <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                        <FormItem className={cn('w-full space-y-2')}>
                            <FormControl>
                                <PhoneInput defaultCountry="AU" {...field} />
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
                    name="merchantRole"
                    render={({ field }) => (
                        <FormItem className={cn('w-full')}>
                            <FormControl>
                                <MultiSelect
                                    {...field}
                                    name="adminRole"
                                    options={merchantRoleOptions}
                                    onValueChange={(selectedValues) => {
                                        form.setValue(
                                            'merchantRole',
                                            selectedValues.map(
                                                (key) => key as MerchantRole
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
