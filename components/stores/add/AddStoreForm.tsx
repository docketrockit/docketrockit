'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
    FormLabel
} from '@/components/ui/form';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { AddStoreSchema } from '@/schemas/stores';
import FormError from '@/components/form/FormError';
import ComponentCard from '@/components/common/ComponentCard';
import { cn } from '@/lib/utils';
import { FormInput } from '@/components/form/FormInputs';
import { SubmitButton } from '@/components/form/Buttons';
import { PhoneInput } from '@/components/ui/phone-input';
import { AddStoreFormProps } from '@/types/store';

const AddStoreForm = ({ brandSlug, brands, currencies }: AddStoreFormProps) => {
    const [error, setError] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();
    const [openBrand, setOpenBrand] = useState(false);
    const [openCurrency, setOpenCurrency] = useState(false);

    const errorClass = 'pl-6';

    const form = useForm<z.infer<typeof AddStoreSchema>>({
        resolver: zodResolver(AddStoreSchema),
        defaultValues: {
            brandSlug,
            name: '',
            phoneNumber: '',
            address1: '',
            address2: '',
            region: '',
            postalCode: '',
            country: '',
            city: '',
            formattedAddress: '',
            countryCode: '',
            latitude: 0,
            longitude: 0,
            abn: '',
            acn: '',
            currency: ''
        }
    });

    const onSubmit = (values: z.infer<typeof AddStoreSchema>) => {
        setError('');
        startTransition(async () => {
            // const logoUrl = await uploadImage(values.logoUrl[0].value, 'logos');
            // const formData = { ...values, logoUrl: logoUrl.publicUrl };
            // const data = await createBrand(formData);
            // if (!data.data) {
            //     setError(data.error);
            // }
        });
    };

    return (
        <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                <FormError message={error} />
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div className="space-y-6">
                        <ComponentCard>
                            <div className="space-y-6">
                                <div className="flex flex-col space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="brandSlug"
                                        render={({ field }) => (
                                            <FormItem className={cn('w-full')}>
                                                <FormLabel required={true}>
                                                    Brand
                                                </FormLabel>
                                                <Popover
                                                    open={openBrand}
                                                    onOpenChange={setOpenBrand}
                                                >
                                                    <PopoverTrigger
                                                        asChild
                                                        className="w-full"
                                                    >
                                                        <FormControl>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                aria-expanded={
                                                                    openBrand
                                                                }
                                                                className="h-12 w-full justify-between rounded-xl px-6 py-3 text-sm font-normal"
                                                            >
                                                                {field.value
                                                                    ? brands.find(
                                                                          (
                                                                              brand
                                                                          ) =>
                                                                              brand.slug ===
                                                                              field.value
                                                                      )?.name
                                                                    : 'Select Merchant...'}
                                                                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-full p-0">
                                                        <Command
                                                            className="w-full"
                                                            filter={(
                                                                value,
                                                                search
                                                            ) => {
                                                                const item =
                                                                    brands.find(
                                                                        (
                                                                            item
                                                                        ) =>
                                                                            item.slug.toString() ===
                                                                            value
                                                                    );
                                                                if (!item)
                                                                    return 0;
                                                                if (
                                                                    item.name
                                                                        .toLowerCase()
                                                                        .includes(
                                                                            search.toLowerCase()
                                                                        )
                                                                )
                                                                    return 1;

                                                                return 0;
                                                            }}
                                                        >
                                                            <CommandInput
                                                                placeholder="Search Brand..."
                                                                className="h-9 w-full"
                                                            />
                                                            <CommandList className="w-full">
                                                                <CommandEmpty className="w-full">
                                                                    No merchant
                                                                    found.
                                                                </CommandEmpty>
                                                                <CommandGroup className="w-full">
                                                                    {brands.map(
                                                                        (
                                                                            brand
                                                                        ) => (
                                                                            <CommandItem
                                                                                className="w-full"
                                                                                key={
                                                                                    brand.slug
                                                                                }
                                                                                value={brand.slug.toString()}
                                                                                onSelect={() => {
                                                                                    form.setValue(
                                                                                        'brandSlug',
                                                                                        brand.slug
                                                                                    );
                                                                                    setOpenBrand(
                                                                                        false
                                                                                    );
                                                                                }}
                                                                            >
                                                                                {
                                                                                    brand.name
                                                                                }
                                                                                <CheckIcon
                                                                                    className={cn(
                                                                                        'ml-auto h-4 w-4',
                                                                                        brand.slug ===
                                                                                            field.value
                                                                                            ? 'opacity-100'
                                                                                            : 'opacity-0'
                                                                                    )}
                                                                                />
                                                                            </CommandItem>
                                                                        )
                                                                    )}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage
                                                    className={errorClass}
                                                />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem
                                                className={cn(
                                                    'w-full space-y-2'
                                                )}
                                            >
                                                <FormLabel required={true}>
                                                    Brand Name
                                                </FormLabel>
                                                <FormControl>
                                                    <FormInput
                                                        {...field}
                                                        name="name"
                                                        type="text"
                                                        label="Name"
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
                                            <FormItem
                                                className={cn(
                                                    'w-full space-y-2'
                                                )}
                                            >
                                                <FormLabel required={true}>
                                                    Phone Number
                                                </FormLabel>
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
                                        name="abn"
                                        render={({ field }) => (
                                            <FormItem
                                                className={cn(
                                                    'w-full space-y-2'
                                                )}
                                            >
                                                <FormLabel required={true}>
                                                    ABN
                                                </FormLabel>
                                                <FormControl>
                                                    <FormInput
                                                        {...field}
                                                        name="abn"
                                                        type="text"
                                                        label="ABN"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="acn"
                                        render={({ field }) => (
                                            <FormItem
                                                className={cn(
                                                    'w-full space-y-2'
                                                )}
                                            >
                                                <FormLabel required={true}>
                                                    ACN
                                                </FormLabel>
                                                <FormControl>
                                                    <FormInput
                                                        {...field}
                                                        name="acn"
                                                        type="text"
                                                        label="ACN"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="currency"
                                        render={({ field }) => (
                                            <FormItem className={cn('w-full')}>
                                                <FormLabel required={true}>
                                                    Currency
                                                </FormLabel>
                                                <Popover
                                                    open={openCurrency}
                                                    onOpenChange={
                                                        setOpenCurrency
                                                    }
                                                >
                                                    <PopoverTrigger
                                                        asChild
                                                        className="w-full"
                                                    >
                                                        <FormControl>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                aria-expanded={
                                                                    openCurrency
                                                                }
                                                                className="h-12 w-full justify-between rounded-xl px-6 py-3 text-sm font-normal"
                                                            >
                                                                {field.value
                                                                    ? currencies.find(
                                                                          (
                                                                              currency
                                                                          ) =>
                                                                              currency.id ===
                                                                              field.value
                                                                      )?.name
                                                                    : 'Select Currency...'}
                                                                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-full p-0">
                                                        <Command
                                                            className="w-full"
                                                            filter={(
                                                                value,
                                                                search
                                                            ) => {
                                                                const item =
                                                                    currencies.find(
                                                                        (
                                                                            item
                                                                        ) =>
                                                                            item.id.toString() ===
                                                                            value
                                                                    );
                                                                if (!item)
                                                                    return 0;
                                                                if (
                                                                    item.name
                                                                        .toLowerCase()
                                                                        .includes(
                                                                            search.toLowerCase()
                                                                        ) ||
                                                                    item.currency
                                                                        .toLowerCase()
                                                                        .includes(
                                                                            search.toLowerCase()
                                                                        )
                                                                )
                                                                    return 1;

                                                                return 0;
                                                            }}
                                                        >
                                                            <CommandInput
                                                                placeholder="Search Currency..."
                                                                className="h-9 w-full"
                                                            />
                                                            <CommandList className="w-full">
                                                                <CommandEmpty className="w-full">
                                                                    No currency
                                                                    found.
                                                                </CommandEmpty>
                                                                <CommandGroup className="w-full">
                                                                    {currencies.map(
                                                                        (
                                                                            currency
                                                                        ) => (
                                                                            <CommandItem
                                                                                className="w-full"
                                                                                key={
                                                                                    currency.id
                                                                                }
                                                                                value={currency.id.toString()}
                                                                                onSelect={() => {
                                                                                    form.setValue(
                                                                                        'brandSlug',
                                                                                        currency.id
                                                                                    );
                                                                                    setOpenCurrency(
                                                                                        false
                                                                                    );
                                                                                }}
                                                                            >
                                                                                {`${currency.currency} (${currency.name})`}
                                                                                <CheckIcon
                                                                                    className={cn(
                                                                                        'ml-auto h-4 w-4',
                                                                                        currency.id ===
                                                                                            field.value
                                                                                            ? 'opacity-100'
                                                                                            : 'opacity-0'
                                                                                    )}
                                                                                />
                                                                            </CommandItem>
                                                                        )
                                                                    )}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage
                                                    className={errorClass}
                                                />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </ComponentCard>
                        <ComponentCard>
                            <div className="space-y-6">
                                <div className="flex flex-col space-y-6">
                                    <div className="flex justify-end">
                                        <SubmitButton
                                            text="Add Brand"
                                            isPending={isPending}
                                        />
                                    </div>
                                </div>
                            </div>
                        </ComponentCard>
                    </div>
                </div>
            </form>
        </Form>
    );
};

export default AddStoreForm;
