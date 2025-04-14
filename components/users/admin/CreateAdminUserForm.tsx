'use client';

import * as z from 'zod';
import { type UseFormReturn } from 'react-hook-form';
import { AdminRole } from '@prisma/client';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { AdminRoleLabels } from '@/types/user';
import { AdminUserSchema } from '@/schemas/users';

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
    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
            >
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="First name"
                                    className="resize-none"
                                    {...field}
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
                        <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Last name"
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Email"
                                    className="resize-none"
                                    {...field}
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
