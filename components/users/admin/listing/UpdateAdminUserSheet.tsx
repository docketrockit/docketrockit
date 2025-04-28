'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { AdminRole } from '@prisma/client';
import { UserRound, Mail, Briefcase } from 'lucide-react';
import { ReloadIcon } from '@radix-ui/react-icons';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from '@/components/ui/form';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle
} from '@/components/ui/sheet';
import { FormInputIcon } from '@/components/form/FormInputs';
import { MultiSelect } from '@/components/ui/multi-select';
import { AdminRoleLabels } from '@/types/user';
import { updateAdminUser } from '@/actions/admin/adminUsers';
import { AdminUserSchemaUpdate } from '@/schemas/users';
import { cn } from '@/lib/utils';
import { AdminUser } from '@/types/adminUser';
import { PhoneInput } from '@/components/ui/phone-input';

interface UpdateTaskSheetProps
    extends React.ComponentPropsWithRef<typeof Sheet> {
    user: AdminUser;
}

export const UpdateAdminUserSheet = ({
    user,
    ...props
}: UpdateTaskSheetProps) => {
    const [isUpdatePending, startUpdateTransition] = useTransition();

    const adminRoleOptions = Object.values(AdminRole).map((value) => ({
        value,
        label: AdminRoleLabels[value]
    }));

    const form = useForm<z.infer<typeof AdminUserSchemaUpdate>>({
        resolver: zodResolver(AdminUserSchemaUpdate),
        defaultValues: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            jobTitle: user.adminUser?.jobTitle,
            phoneNumber: user.phoneNumber || '',
            adminRole: user.adminUser?.adminRole
        }
    });

    useEffect(() => {
        form.reset({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            jobTitle: user.adminUser?.jobTitle,
            phoneNumber: user.phoneNumber || '',
            adminRole: user.adminUser?.adminRole
        });
    }, [user, form]);

    function onSubmit(input: z.infer<typeof AdminUserSchemaUpdate>) {
        startUpdateTransition(async () => {
            const { error } = await updateAdminUser(input, user.id);

            if (error) {
                toast.error(error);
                return;
            }

            form.reset();
            props.onOpenChange?.(false);
            toast.success('User updated');
        });
    }

    return (
        <Sheet {...props}>
            <SheetContent className="flex flex-col gap-6 sm:max-w-md">
                <SheetHeader className="text-left">
                    <SheetTitle>Update user</SheetTitle>
                    <SheetDescription>
                        Update the type details and save the changes
                    </SheetDescription>
                </SheetHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col gap-4 mx-4"
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
                                        <PhoneInput
                                            defaultCountry="AU"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                                            onValueChange={(selectedValues) => {
                                                form.setValue(
                                                    'adminRole',
                                                    selectedValues.map(
                                                        (key) =>
                                                            key as AdminRole
                                                    )
                                                );
                                            }}
                                            defaultValue={
                                                user.adminUser?.adminRole
                                            }
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

                        <SheetFooter className="gap-2 pt-2 sm:space-x-0">
                            <SheetClose asChild>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </SheetClose>
                            <Button disabled={isUpdatePending}>
                                {isUpdatePending && (
                                    <ReloadIcon className="mr-2 size-4 animate-spin" />
                                )}
                                Save
                            </Button>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
};
