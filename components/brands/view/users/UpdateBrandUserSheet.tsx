'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { BrandRole, Status } from '@prisma/client';
import { UserRound, Mail, Briefcase } from 'lucide-react';
import { ReloadIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
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
import { Switch } from '@/components/ui/switch';
import { FormInputIcon } from '@/components/form/FormInputs';
import { MultiSelect } from '@/components/ui/multi-select';
import { BrandRoleLabels } from '@/types/user';
import { BrandUserSchemaUpdate } from '@/schemas/users';
import { cn } from '@/lib/utils';
import { BrandUser } from '@/types/brandUser';
import { updateBrandUser } from '@/actions/admin/brandUsers';
import { PhoneInput } from '@/components/ui/phone-input';

interface UpdateBrandUserSheetProps
    extends React.ComponentPropsWithRef<typeof Sheet> {
    user: BrandUser;
    brandId: string;
    brandSlug: string;
    merchantId: string;
    merchantSlug: string;
}

export const UpdateBrandUserSheet = ({
    user,
    brandId,
    brandSlug,
    merchantId,
    merchantSlug,
    ...props
}: UpdateBrandUserSheetProps) => {
    const [isUpdatePending, startUpdateTransition] = useTransition();
    const statusValues = Object.values(Status);

    const brandRoleOptions = Object.values(BrandRole).map((value) => ({
        value,
        label: BrandRoleLabels[value]
    }));

    const brandUser = user.merchantUser?.brandUsers.find(
        (brand) => brand.brandId === brandId
    );

    const form = useForm<z.infer<typeof BrandUserSchemaUpdate>>({
        resolver: zodResolver(BrandUserSchemaUpdate),
        defaultValues: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            jobTitle: user.merchantUser?.jobTitle,
            brandRole: brandUser?.brandRole || [],
            primaryContact: user.primaryContactBrand !== null,
            phoneNumber: user.phoneNumber || '',
            status: user.status
        }
    });

    useEffect(() => {
        form.reset({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            jobTitle: user.merchantUser?.jobTitle,
            brandRole: brandUser?.brandRole || [],
            primaryContact: user.primaryContactBrand !== null,
            phoneNumber: user.phoneNumber || '',
            status: user.status
        });
    }, [user, form]);

    function onSubmit(input: z.infer<typeof BrandUserSchemaUpdate>) {
        startUpdateTransition(async () => {
            if (brandUser) {
                const { error } = await updateBrandUser(
                    input,
                    user.id,
                    merchantId,
                    merchantSlug,
                    brandUser.id,
                    brandId,
                    brandSlug
                );
                if (error) {
                    toast.error(error);
                    return;
                }
                form.reset();
                props.onOpenChange?.(false);
                toast.success('User updated');
            }
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
                            name="primaryContact"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-xs">
                                    <div className="space-y-0.5">
                                        <FormLabel>Primary Contact?</FormLabel>
                                        <FormDescription>
                                            Checking this user as the primarary
                                            contact will remove the previous
                                            user as the primary contact
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
                            name="brandRole"
                            render={({ field }) => (
                                <FormItem className={cn('w-full')}>
                                    <FormControl>
                                        <MultiSelect
                                            {...field}
                                            name="access"
                                            options={brandRoleOptions}
                                            onValueChange={(selectedValues) => {
                                                form.setValue(
                                                    'brandRole',
                                                    selectedValues.map(
                                                        (key) =>
                                                            key as BrandRole
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
