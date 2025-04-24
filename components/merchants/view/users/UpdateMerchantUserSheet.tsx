'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { MerchantRole, Status } from '@prisma/client';
import { UserRound, Mail, Briefcase } from 'lucide-react';
import { ReloadIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { FormInputIcon } from '@/components/form/FormInputs';
import { MultiSelect } from '@/components/ui/multi-select';
import { MerchantRoleLabels } from '@/types/user';
import { MerchantUserSchemaUpdate } from '@/schemas/users';
import { cn } from '@/lib/utils';
import { MerchantUser } from '@/types/merchantUsers';
import { updateMerchantUser } from '@/actions/admin/merchantUsers';

interface UpdateMerchantUserSheetProps
    extends React.ComponentPropsWithRef<typeof Sheet> {
    user: MerchantUser;
    merchantSlug: string;
}

export const UpdateMerchantUserSheet = ({
    user,
    merchantSlug,
    ...props
}: UpdateMerchantUserSheetProps) => {
    const [isUpdatePending, startUpdateTransition] = useTransition();
    const statusValues = Object.values(Status);

    const merchantRoleOptions = Object.values(MerchantRole).map((value) => ({
        value,
        label: MerchantRoleLabels[value]
    }));

    const form = useForm<z.infer<typeof MerchantUserSchemaUpdate>>({
        resolver: zodResolver(MerchantUserSchemaUpdate),
        defaultValues: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            jobTitle: user.merchantUser?.jobTitle,
            merchantRole: user.merchantUser?.merchantRole,
            primaryContact: user.merchantUser?.primaryContact,
            status: user.status
        }
    });

    useEffect(() => {
        form.reset({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            jobTitle: user.merchantUser?.jobTitle,
            merchantRole: user.merchantUser?.merchantRole,
            primaryContact: user.merchantUser?.primaryContact,
            status: user.status
        });
    }, [user, form]);

    function onSubmit(input: z.infer<typeof MerchantUserSchemaUpdate>) {
        startUpdateTransition(async () => {
            const { error } = await updateMerchantUser(
                input,
                user.id,
                merchantSlug
            );
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
                        Update the user details and save the changes
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
                                            name="access"
                                            options={merchantRoleOptions}
                                            onValueChange={(selectedValues) => {
                                                form.setValue(
                                                    'merchantRole',
                                                    selectedValues.map(
                                                        (key) =>
                                                            key as MerchantRole
                                                    )
                                                );
                                            }}
                                            defaultValue={
                                                user.merchantUser?.merchantRole
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
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <Select
                                        {...field}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {statusValues.map(
                                                (value, index) => (
                                                    <SelectItem
                                                        key={index}
                                                        value={value}
                                                    >
                                                        {value}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
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
