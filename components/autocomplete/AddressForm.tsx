'use client';

import * as z from 'zod';
import { useFormContext } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';

import { cn } from '@/lib/utils';
import { AddStoreSchema } from '@/schemas/stores';
import { AddressFormProps } from '@/types/autocomplete';

const AddressForm = (props: React.PropsWithChildren<AddressFormProps>) => {
    const { address } = props;
    const errorClass = 'pl-6';
    const form = useFormContext<z.infer<typeof AddStoreSchema>>();

    return (
        <div className="space-y-4 py-7">
            <div className="space-y-0.5">
                <FormField
                    control={form.control}
                    name="address1"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel
                                className={cn(
                                    'block text-lg leading-6 font-medium text-gray-900'
                                )}
                            >
                                Address line 1
                            </FormLabel>
                            <FormControl>
                                <Input
                                    disabled={address?.address1 === ''}
                                    placeholder="Address line 1"
                                    className={cn(
                                        'block h-14 w-full rounded-lg border-neutral-200 bg-white px-5'
                                    )}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className={errorClass} />
                        </FormItem>
                    )}
                />
            </div>

            <div className="space-y-0.5">
                <FormField
                    control={form.control}
                    name="address2"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel
                                className={cn(
                                    'block text-lg leading-6 font-medium text-gray-900'
                                )}
                            >
                                Address line 2
                            </FormLabel>
                            <FormControl>
                                <Input
                                    disabled={address?.address2 === ''}
                                    placeholder="Address line 2"
                                    className={cn(
                                        'block h-14 w-full rounded-lg border-neutral-200 bg-white px-5'
                                    )}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className={errorClass} />
                        </FormItem>
                    )}
                />
            </div>

            <div className="flex gap-4">
                <div className="flex-1 space-y-0.5">
                    <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel
                                    className={cn(
                                        'block text-lg leading-6 font-medium text-gray-900'
                                    )}
                                >
                                    City
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={address?.city === ''}
                                        placeholder="City"
                                        className={cn(
                                            'block h-14 w-full rounded-lg border-neutral-200 bg-white px-5'
                                        )}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className={errorClass} />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex-1 space-y-0.5">
                    <FormField
                        control={form.control}
                        name="region"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel
                                    className={cn(
                                        'block text-lg leading-6 font-medium text-gray-900'
                                    )}
                                >
                                    State / Province / Region
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={address?.region === ''}
                                        placeholder="State / Province / Region"
                                        className={cn(
                                            'block h-14 w-full rounded-lg border-neutral-200 bg-white px-5'
                                        )}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className={errorClass} />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            <div className="flex gap-4">
                <div className="flex-1 space-y-0.5">
                    <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel
                                    className={cn(
                                        'block text-lg leading-6 font-medium text-gray-900'
                                    )}
                                >
                                    Postcode
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={address?.postalCode === ''}
                                        placeholder="Postcode"
                                        className={cn(
                                            'block h-14 w-full rounded-lg border-neutral-200 bg-white px-5'
                                        )}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className={errorClass} />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex-1 space-y-0.5">
                    <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel
                                    className={cn(
                                        'block text-lg leading-6 font-medium text-gray-900'
                                    )}
                                >
                                    Country
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        disabled
                                        placeholder="Country"
                                        className={cn(
                                            'block h-14 w-full rounded-lg border-neutral-200 bg-white px-5'
                                        )}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className={errorClass} />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="countryCode"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input type="hidden" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="formattedAddress"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input type="hidden" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="latitude"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input type="hidden" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="longitude"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input type="hidden" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </div>
    );
};

export default AddressForm;
