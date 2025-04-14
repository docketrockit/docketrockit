'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { BreweryType } from '@prisma/client';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/global/Icons';

import { updateBreweryType } from '@/actions/breweryTypes';
import { BreweryTypeSchema } from '@/schemas/admin';
import { statusLabels } from '@/utils/types';

interface UpdateTaskSheetProps
    extends React.ComponentPropsWithRef<typeof Sheet> {
    type: BreweryType;
}

export const UpdateUserAdminSheet = ({
    type,
    ...props
}: UpdateTaskSheetProps) => {
    const [isUpdatePending, startUpdateTransition] = useTransition();

    const form = useForm<z.infer<typeof BreweryTypeSchema>>({
        resolver: zodResolver(BreweryTypeSchema),
        defaultValues: {
            status: type.status,
            name: type.name
        }
    });

    useEffect(() => {
        form.reset({
            status: type.status,
            name: type.name
        });
    }, [type, form]);

    function onSubmit(input: z.infer<typeof BreweryTypeSchema>) {
        startUpdateTransition(async () => {
            const { error } = await updateBreweryType(input, type.id);

            if (error) {
                toast.error(error);
                return;
            }

            form.reset();
            props.onOpenChange?.(false);
            toast.success('Task updated');
        });
    }

    return (
        <Sheet {...props}>
            <SheetContent className="flex flex-col gap-6 sm:max-w-md">
                <SheetHeader className="text-left">
                    <SheetTitle>Update task</SheetTitle>
                    <SheetDescription>
                        Update the type details and save the changes
                    </SheetDescription>
                </SheetHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col gap-4"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Do a kickflip"
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
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="capitalize">
                                                <SelectValue placeholder="Select a status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectGroup>
                                                {statusLabels.map((item) => (
                                                    <SelectItem
                                                        key={item.value}
                                                        value={item.value}
                                                        className="capitalize"
                                                    >
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
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
                                    <Icons.spinner
                                        className="mr-2 size-4 animate-spin"
                                        aria-hidden="true"
                                    />
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
