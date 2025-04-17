'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
    FormLabel
} from '@/components/ui/form';
import { MerchantSchema } from '@/schemas/merchants';
import FormError from '@/components/form/FormError';
import ComponentCard from '@/components/common/ComponentCard';
import { cn } from '@/lib/utils';
import { FormInput } from '@/components/form/FormInputs';
import { SubmitButton } from '@/components/form/Buttons';
import { createMerchant } from '@/actions/merchants';
import { uploadImage } from '@/utils/supabase';
import { PhoneInput } from '@/components/ui/phone-input';
import { formatABN, formatACN } from '@/utils/businessNumberValidation';
import MerchantLogoUpload from './MerchantLogoUpload';

const AddMerchantForm = ({ country }: { country: string | null }) => {
    const [error, setError] = useState<string | undefined>('');
    const [success, setSuccess] = useState<boolean>(false);
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof MerchantSchema>>({
        resolver: zodResolver(MerchantSchema),
        defaultValues: {
            name: '',
            phoneNumber: '',
            genericEmail: '',
            invoiceEmail: '',
            address1: '',
            address2: '',
            suburb: '',
            postcode: '',
            state: '',
            country: country || '',
            abn: '',
            acn: '',
            logoUrl: []
        }
    });

    const abn = form.watch('abn');
    const acn = form.watch('acn');

    const onSubmit = (values: z.infer<typeof MerchantSchema>) => {
        setError('');
        setSuccess(false);
        startTransition(async () => {
            const logoUrl = await uploadImage(
                values.logoUrl[0].value,
                'logos-bucket'
            );
            const formData = { ...values, logoUrl: logoUrl.publicUrl };
            const data = await createMerchant(formData);
            if (!data.data) {
                setError(data.error);
            }
        });
    };

    return (
        // <div className="w-1/2">

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
                                                    Merchant Name
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
                                                    <PhoneInput defaultCountry="AU" />
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
                                                        name="email"
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
                                                        name="email"
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
                                                        value={formatABN(abn)}
                                                        onChange={(e) =>
                                                            form.setValue(
                                                                'abn',
                                                                e.target.value
                                                            )
                                                        }
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
                                                        value={formatACN(acn)}
                                                        onChange={(e) =>
                                                            form.setValue(
                                                                'acn',
                                                                e.target.value
                                                            )
                                                        }
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
                                    <div className="flex justify-end">
                                        <SubmitButton
                                            text="Add User"
                                            isPending={isPending}
                                        />
                                    </div>
                                </div>
                            </div>
                        </ComponentCard>
                    </div>
                    <div className="space-y-6">
                        <ComponentCard>
                            <MerchantLogoUpload />
                        </ComponentCard>
                    </div>
                </div>
            </form>
        </Form>
    );
};

export default AddMerchantForm;
