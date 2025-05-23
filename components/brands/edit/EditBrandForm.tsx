'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useTransition, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Country, State } from '@prisma/client';
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
import { EditBrandSchema } from '@/schemas/brands';
import FormError from '@/components/form/FormError';
import ComponentCard from '@/components/common/ComponentCard';
import { cn } from '@/lib/utils';
import { FormInput } from '@/components/form/FormInputs';
import { SubmitButton } from '@/components/form/Buttons';
import { PhoneInput } from '@/components/ui/phone-input';
import { EditBrandFormProps } from '@/types/brand';
import { getStatesByCountry } from '@/data/location';
import { updateBrand } from '@/actions/brands';

const EditBrandForm = ({
    brand,
    countryProp,
    countries,
    states,
    stateProp
}: EditBrandFormProps) => {
    const [error, setError] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();
    const [countriesList, setCountriesList] = useState<Country[]>(countries);
    const [statesList, setStatesList] = useState<State[]>(states);
    const [country, setCountry] = useState(countryProp);
    const [state, setState] = useState(stateProp);
    const [openCountry, setOpenCountry] = useState(false);
    const [openState, setOpenState] = useState(false);
    const [openMerchant, setOpenMerchant] = useState(false);

    const errorClass = 'pl-6';

    const form = useForm<z.infer<typeof EditBrandSchema>>({
        resolver: zodResolver(EditBrandSchema),
        defaultValues: {
            name: brand.name,
            tradingAsName: brand.tradingAsName,
            phoneNumber: brand.phoneNumber,
            genericEmail: brand.genericEmail,
            invoiceEmail: brand.invoiceEmail || '',
            address1: brand.address1,
            address2: brand.address2 || '',
            suburb: brand.suburb,
            postcode: brand.postcode,
            state: brand.state.id,
            country: country?.id || '',
            abn: brand.abn || '',
            acn: brand.acn || ''
        }
    });

    const onSubmit = (values: z.infer<typeof EditBrandSchema>) => {
        setError('');
        startTransition(async () => {
            const data = await updateBrand({
                id: brand.id,
                values,
                merchantSlug: brand.merchant.slug
            });
            if (!data.data) {
                setError(data.error);
            }
        });
    };

    useEffect(() => {
        const fetchStates = async () => {
            try {
                const result = await getStatesByCountry(
                    form.getValues('country')
                );
                form.setValue('state', state?.id || '');
                setStatesList(result!);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchStates();
    }, [form.watch('country')]);

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
                                        name="tradingAsName"
                                        render={({ field }) => (
                                            <FormItem
                                                className={cn(
                                                    'w-full space-y-2'
                                                )}
                                            >
                                                <FormLabel required={true}>
                                                    Trading as Name
                                                </FormLabel>
                                                <FormControl>
                                                    <FormInput
                                                        {...field}
                                                        name="tradingAsName"
                                                        type="text"
                                                        label="Trading as Name"
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
                                        name="genericEmail"
                                        render={({ field }) => (
                                            <FormItem
                                                className={cn(
                                                    'w-full space-y-2'
                                                )}
                                            >
                                                <FormLabel required={true}>
                                                    Generic Email
                                                </FormLabel>
                                                <FormControl>
                                                    <FormInput
                                                        {...field}
                                                        name="genericEmail"
                                                        type="email"
                                                        label="Generic Email"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="invoiceEmail"
                                        render={({ field }) => (
                                            <FormItem
                                                className={cn(
                                                    'w-full space-y-2'
                                                )}
                                            >
                                                <FormLabel>
                                                    Invoice Email
                                                </FormLabel>
                                                <FormControl>
                                                    <FormInput
                                                        {...field}
                                                        name="invoiceEmail"
                                                        type="email"
                                                        label="Invoice Email"
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
                                </div>
                            </div>
                        </ComponentCard>
                        <ComponentCard>
                            <div className="space-y-6">
                                <div className="flex flex-col space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="address1"
                                        render={({ field }) => (
                                            <FormItem
                                                className={cn(
                                                    'w-full space-y-2'
                                                )}
                                            >
                                                <FormLabel required={true}>
                                                    Address Line 1
                                                </FormLabel>
                                                <FormControl>
                                                    <FormInput
                                                        {...field}
                                                        name="address1"
                                                        type="text"
                                                        label="Address Line 1"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="address2"
                                        render={({ field }) => (
                                            <FormItem
                                                className={cn(
                                                    'w-full space-y-2'
                                                )}
                                            >
                                                <FormLabel>
                                                    Address Line 2
                                                </FormLabel>
                                                <FormControl>
                                                    <FormInput
                                                        {...field}
                                                        name="address2"
                                                        type="text"
                                                        label="Address Line 2"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="suburb"
                                        render={({ field }) => (
                                            <FormItem
                                                className={cn(
                                                    'w-full space-y-2'
                                                )}
                                            >
                                                <FormLabel required={true}>
                                                    Suburb
                                                </FormLabel>
                                                <FormControl>
                                                    <FormInput
                                                        {...field}
                                                        name="suburb"
                                                        type="text"
                                                        label="Suburb"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="postcode"
                                        render={({ field }) => (
                                            <FormItem
                                                className={cn(
                                                    'w-full space-y-2'
                                                )}
                                            >
                                                <FormLabel required={true}>
                                                    Postcode
                                                </FormLabel>
                                                <FormControl>
                                                    <FormInput
                                                        {...field}
                                                        name="postcode"
                                                        type="text"
                                                        label="Postcode"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex flex-row gap-x-6">
                                        <FormField
                                            control={form.control}
                                            name="country"
                                            render={({ field }) => (
                                                <FormItem
                                                    className={cn('w-full')}
                                                >
                                                    <FormLabel required={true}>
                                                        Country
                                                    </FormLabel>
                                                    <Popover
                                                        open={openCountry}
                                                        onOpenChange={
                                                            setOpenCountry
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
                                                                        openCountry
                                                                    }
                                                                    className="h-12 w-full justify-between rounded-xl px-6 py-3 text-sm font-normal"
                                                                >
                                                                    {field.value
                                                                        ? countriesList.find(
                                                                              (
                                                                                  country
                                                                              ) =>
                                                                                  country.id ===
                                                                                  field.value
                                                                          )
                                                                              ?.name
                                                                        : 'Select Country...'}
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
                                                                        countriesList.find(
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
                                                                            )
                                                                    )
                                                                        return 1;

                                                                    return 0;
                                                                }}
                                                            >
                                                                <CommandInput
                                                                    placeholder="Search Country..."
                                                                    className="h-9 w-full"
                                                                />
                                                                <CommandList className="w-full">
                                                                    <CommandEmpty className="w-full">
                                                                        No
                                                                        country
                                                                        found.
                                                                    </CommandEmpty>
                                                                    <CommandGroup className="w-full">
                                                                        {countriesList.map(
                                                                            (
                                                                                country
                                                                            ) => (
                                                                                <CommandItem
                                                                                    className="w-full"
                                                                                    key={
                                                                                        country.id
                                                                                    }
                                                                                    value={country.id.toString()}
                                                                                    onSelect={() => {
                                                                                        form.setValue(
                                                                                            'country',
                                                                                            country.id
                                                                                        );
                                                                                        setOpenCountry(
                                                                                            false
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        country.name
                                                                                    }
                                                                                    <CheckIcon
                                                                                        className={cn(
                                                                                            'ml-auto h-4 w-4',
                                                                                            country.id ===
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
                                            name="state"
                                            render={({ field }) => (
                                                <FormItem
                                                    className={cn('w-full')}
                                                >
                                                    <FormLabel required={true}>
                                                        State
                                                    </FormLabel>
                                                    <Popover
                                                        open={openState}
                                                        onOpenChange={
                                                            setOpenState
                                                        }
                                                    >
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant="outline"
                                                                    role="combobox"
                                                                    aria-expanded={
                                                                        openState
                                                                    }
                                                                    className="h-12 w-full justify-between rounded-xl px-6 py-3 text-sm font-normal"
                                                                >
                                                                    {field.value &&
                                                                    field.value !==
                                                                        ''
                                                                        ? statesList.find(
                                                                              (
                                                                                  state
                                                                              ) =>
                                                                                  state.id ===
                                                                                  field.value
                                                                          )
                                                                              ?.name
                                                                        : 'Select State...'}
                                                                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-full p-0">
                                                            <Command
                                                                filter={(
                                                                    value,
                                                                    search
                                                                ) => {
                                                                    const item =
                                                                        statesList.find(
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
                                                                            )
                                                                    )
                                                                        return 1;

                                                                    return 0;
                                                                }}
                                                            >
                                                                <CommandInput
                                                                    placeholder="Search State..."
                                                                    className="h-9"
                                                                />
                                                                <CommandList>
                                                                    <CommandEmpty>
                                                                        No
                                                                        states
                                                                        found.
                                                                    </CommandEmpty>
                                                                    <CommandGroup>
                                                                        {statesList.map(
                                                                            (
                                                                                state
                                                                            ) => (
                                                                                <CommandItem
                                                                                    key={
                                                                                        state.id
                                                                                    }
                                                                                    value={state.id.toString()}
                                                                                    onSelect={() => {
                                                                                        form.setValue(
                                                                                            'state',
                                                                                            state.id
                                                                                        );
                                                                                        setOpenState(
                                                                                            false
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        state.name
                                                                                    }
                                                                                    <CheckIcon
                                                                                        className={cn(
                                                                                            'ml-auto h-4 w-4',
                                                                                            state.id ===
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
                                    <div className="flex justify-end">
                                        <SubmitButton
                                            text="Update Brand"
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

export default EditBrandForm;
