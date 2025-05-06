'use client';

import * as z from 'zod';
import { Delete } from 'lucide-react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetcher } from '@/utils/fetcher';
import { AddressAutoCompleteProps, AddressType } from '@/types/autocomplete';
import AddressAutoCompleteInput from './AddressAutoCompleteInput';
import AddressForm from './AddressForm';
import { AddStoreSchema } from '@/schemas/stores';
import { cn } from '@/lib/utils';

const AddressAutoComplete = (props: AddressAutoCompleteProps) => {
    const {
        address,
        setAddress,
        showInlineError = true,
        searchInput,
        setSearchInput,
        placeholder
    } = props;

    const form = useFormContext<z.infer<typeof AddStoreSchema>>();

    const [selectedPlaceId, setSelectedPlaceId] = useState('');
    const { data, isLoading } = useSWR(
        selectedPlaceId === ''
            ? null
            : `/api/address/place?placeId=${selectedPlaceId}`,
        fetcher,
        {
            revalidateOnFocus: false
        }
    );

    useEffect(() => {
        if (data?.data.address) {
            setAddress(data.data.address as AddressType);
            const adrInputs = data.data.address as AddressType;
            form.setValue('address1', adrInputs.address1);
            form.setValue('address2', adrInputs.address2);
            form.setValue('city', adrInputs.city);
            form.setValue('region', adrInputs.region);
            form.setValue('postalCode', adrInputs.postalCode);
            form.setValue('country', adrInputs.country);
            form.setValue('formattedAddress', adrInputs.formattedAddress);
            form.setValue('countryCode', adrInputs.countryCode);
            form.setValue('latitude', adrInputs.lat);
            form.setValue('longitude', adrInputs.lng);
        }
    }, [data, setAddress]);

    return (
        <>
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <Input
                        value="Loading..."
                        readOnly
                        className={cn(
                            'block h-14 w-full rounded-lg border-neutral-200 bg-white px-5'
                        )}
                    />
                </div>
            ) : selectedPlaceId !== '' || address.formattedAddress ? (
                <div className="flex items-center gap-2">
                    <Input
                        value={address?.formattedAddress}
                        readOnly
                        className={cn(
                            'block h-14 w-full rounded-lg border-neutral-200 bg-white px-5'
                        )}
                    />
                    <Button
                        type="reset"
                        onClick={() => {
                            setSelectedPlaceId('');
                            setAddress({
                                address1: '',
                                address2: '',
                                formattedAddress: '',
                                city: '',
                                region: '',
                                postalCode: '',
                                country: '',
                                lat: 0,
                                lng: 0,
                                countryCode: ''
                            });
                        }}
                        variant="outline"
                        className="h-14 w-14 shrink-0"
                    >
                        <Delete className="size-6" />
                    </Button>
                </div>
            ) : (
                <AddressAutoCompleteInput
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                    selectedPlaceId={selectedPlaceId}
                    setSelectedPlaceId={setSelectedPlaceId}
                    showInlineError={showInlineError}
                    placeholder={placeholder}
                />
            )}
            <AddressForm address={address} />
        </>
    );
};

export default AddressAutoComplete;
