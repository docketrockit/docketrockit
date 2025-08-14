'use client';

import * as z from 'zod';
import { type UseFormReturn } from 'react-hook-form';
import { MerchantRole } from '@/generated/prisma';
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
    FormMessage,
    FormLabel,
    FormDescription
} from '@/components/ui/form';
import {
    FormInputIcon,
    FormInputIconPassword
} from '@/components/form/FormInputs';
import { Switch } from '@/components/ui/switch';
import { MultiSelect } from '@/components/ui/multi-select';
import { MerchantRoleLabels } from '@/types/user';
import { MerchantUserSchema } from '@/schemas/users';
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

export const CreateMerchantUserForm = ({
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
                    name="primaryContact"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-xs">
                            <div className="space-y-0.5">
                                <FormLabel>Primary Contact?</FormLabel>
                                <FormDescription>
                                    Checking this user as the primarary contact
                                    will remove the previous user as the primary
                                    contact
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
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
                                    name="merchantRole"
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
