'use client';

import { z } from 'zod';
import { useState, useTransition, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Status, UserRole, AccessLevel, Permission } from '@prisma/client';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import {
    createUser,
    getMerchants,
    getCountries
} from '@/actions/admin/adminUsers';

const addUserSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phoneNumber: z.string().optional(),
    countryId: z.string().optional(),
    regionId: z.string().optional(),
    role: z
        .array(z.nativeEnum(UserRole))
        .min(1, 'At least one role is required'),
    status: z.nativeEnum(Status),
    businessAccess: z
        .array(
            z.object({
                accessLevel: z.nativeEnum(AccessLevel),
                permissions: z
                    .array(z.nativeEnum(Permission))
                    .min(1, 'At least one permission is required'),
                merchantId: z.string().optional(),
                brandId: z.string().optional(),
                storeId: z.string().optional(),
                jobTitle: z.string().optional()
            })
        )
        .min(1, 'At least one business access is required')
});

type AddUserFormData = z.infer<typeof addUserSchema>;

interface AddUserFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function AddUserForm({ onSuccess, onCancel }: AddUserFormProps) {
    const [isPending, startTransition] = useTransition();
    const [countries, setCountries] = useState<any[]>([]);
    const [merchants, setMerchants] = useState<any[]>([]);

    const form = useForm<AddUserFormData>({
        resolver: zodResolver(addUserSchema),
        defaultValues: {
            name: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            countryId: 'defaultCountryId', // Updated default value
            regionId: 'defaultRegionId', // Updated default value
            role: [UserRole.USER],
            status: Status.PENDING,
            businessAccess: [
                {
                    accessLevel: AccessLevel.STORE,
                    permissions: [Permission.READ],
                    merchantId: 'defaultMerchantId', // Updated default value
                    brandId: 'defaultBrandId', // Updated default value
                    storeId: 'defaultStoreId', // Updated default value
                    jobTitle: ''
                }
            ]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'businessAccess'
    });

    useEffect(() => {
        const loadData = async () => {
            const [countriesData, merchantsData] = await Promise.all([
                getCountries(),
                getMerchants()
            ]);
            setCountries(countriesData);
            setMerchants(merchantsData);
        };
        loadData();
    }, []);

    const onSubmit = (data: AddUserFormData) => {
        startTransition(async () => {
            // Filter out empty optional fields
            const cleanedData = {
                ...data,
                phoneNumber: data.phoneNumber || undefined,
                countryId: data.countryId || undefined,
                regionId: data.regionId || undefined,
                businessAccess: data.businessAccess.map((access) => ({
                    ...access,
                    merchantId: access.merchantId || undefined,
                    brandId: access.brandId || undefined,
                    storeId: access.storeId || undefined,
                    jobTitle: access.jobTitle || undefined
                }))
            };

            const result = await createUser(cleanedData);

            if (result.success) {
                toast.success('User created successfully');
                form.reset();
                onSuccess?.();
            } else {
                toast.error(result.error || 'Failed to create user');
            }
        });
    };

    const selectedCountry = form.watch('countryId');
    const selectedCountryData = countries.find((c) => c.id === selectedCountry);

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">First Name *</Label>
                            <Input id="name" {...form.register('name')} />
                            {form.formState.errors.name && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.name.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                                id="lastName"
                                {...form.register('lastName')}
                            />
                            {form.formState.errors.lastName && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.lastName.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            {...form.register('email')}
                        />
                        {form.formState.errors.email && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                            id="phoneNumber"
                            {...form.register('phoneNumber')}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Country</Label>
                            <Select
                                value={form.watch('countryId')}
                                onValueChange={(value) =>
                                    form.setValue('countryId', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="defaultCountryId">
                                        No country
                                    </SelectItem>{' '}
                                    {/* Updated value */}
                                    {countries.map((country) => (
                                        <SelectItem
                                            key={country.id}
                                            value={country.id}
                                        >
                                            {country.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Region</Label>
                            <Select
                                value={form.watch('regionId')}
                                onValueChange={(value) =>
                                    form.setValue('regionId', value)
                                }
                                disabled={!selectedCountryData}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select region" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="defaultRegionId">
                                        No region
                                    </SelectItem>{' '}
                                    {/* Updated value */}
                                    {selectedCountryData?.regions.map(
                                        (region: any) => (
                                            <SelectItem
                                                key={region.id}
                                                value={region.id}
                                            >
                                                {region.name}
                                            </SelectItem>
                                        )
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Status *</Label>
                        <Select
                            value={form.watch('status')}
                            onValueChange={(value) =>
                                form.setValue('status', value as Status)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(Status).map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status.charAt(0) +
                                            status.slice(1).toLowerCase()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Roles *</Label>
                        <div className="flex flex-wrap gap-2">
                            {Object.values(UserRole).map((role) => (
                                <div
                                    key={role}
                                    className="flex items-center space-x-2"
                                >
                                    <Checkbox
                                        id={role}
                                        checked={form
                                            .watch('role')
                                            .includes(role)}
                                        onCheckedChange={(checked) => {
                                            const currentRoles =
                                                form.watch('role');
                                            if (checked) {
                                                form.setValue('role', [
                                                    ...currentRoles,
                                                    role
                                                ]);
                                            } else {
                                                form.setValue(
                                                    'role',
                                                    currentRoles.filter(
                                                        (r) => r !== role
                                                    )
                                                );
                                            }
                                        }}
                                    />
                                    <Label htmlFor={role}>{role}</Label>
                                </div>
                            ))}
                        </div>
                        {form.formState.errors.role && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.role.message}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Business Access */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Business Access *
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                append({
                                    accessLevel: AccessLevel.STORE,
                                    permissions: [Permission.READ],
                                    merchantId: 'defaultMerchantId', // Updated value
                                    brandId: 'defaultBrandId', // Updated value
                                    storeId: 'defaultStoreId', // Updated value
                                    jobTitle: ''
                                })
                            }
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Access
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {fields.map((field, index) => (
                        <div
                            key={field.id}
                            className="border rounded-lg p-4 space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium">
                                    Access Level {index + 1}
                                </h4>
                                {fields.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => remove(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Access Level *</Label>
                                    <Select
                                        value={form.watch(
                                            `businessAccess.${index}.accessLevel`
                                        )}
                                        onValueChange={(value) =>
                                            form.setValue(
                                                `businessAccess.${index}.accessLevel`,
                                                value as AccessLevel
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(AccessLevel).map(
                                                (level) => (
                                                    <SelectItem
                                                        key={level}
                                                        value={level}
                                                    >
                                                        {level.charAt(0) +
                                                            level
                                                                .slice(1)
                                                                .toLowerCase()}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Job Title</Label>
                                    <Input
                                        {...form.register(
                                            `businessAccess.${index}.jobTitle`
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Permissions *</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.values(Permission).map(
                                        (permission) => (
                                            <div
                                                key={permission}
                                                className="flex items-center space-x-2"
                                            >
                                                <Checkbox
                                                    id={`${index}-${permission}`}
                                                    checked={form
                                                        .watch(
                                                            `businessAccess.${index}.permissions`
                                                        )
                                                        .includes(permission)}
                                                    onCheckedChange={(
                                                        checked
                                                    ) => {
                                                        const currentPermissions =
                                                            form.watch(
                                                                `businessAccess.${index}.permissions`
                                                            );
                                                        if (checked) {
                                                            form.setValue(
                                                                `businessAccess.${index}.permissions`,
                                                                [
                                                                    ...currentPermissions,
                                                                    permission
                                                                ]
                                                            );
                                                        } else {
                                                            form.setValue(
                                                                `businessAccess.${index}.permissions`,
                                                                currentPermissions.filter(
                                                                    (p) =>
                                                                        p !==
                                                                        permission
                                                                )
                                                            );
                                                        }
                                                    }}
                                                />
                                                <Label
                                                    htmlFor={`${index}-${permission}`}
                                                    className="text-sm"
                                                >
                                                    {permission.replace(
                                                        '_',
                                                        ' '
                                                    )}
                                                </Label>
                                            </div>
                                        )
                                    )}
                                </div>
                                {form.formState.errors.businessAccess?.[index]
                                    ?.permissions && (
                                    <p className="text-sm text-destructive">
                                        {
                                            form.formState.errors
                                                .businessAccess[index]
                                                ?.permissions?.message
                                        }
                                    </p>
                                )}
                            </div>

                            {/* Hierarchical Business Selection */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Merchant</Label>
                                    <Select
                                        value={form.watch(
                                            `businessAccess.${index}.merchantId`
                                        )}
                                        onValueChange={(value) => {
                                            form.setValue(
                                                `businessAccess.${index}.merchantId`,
                                                value
                                            );
                                            // Reset brand and store when merchant changes
                                            form.setValue(
                                                `businessAccess.${index}.brandId`,
                                                ''
                                            );
                                            form.setValue(
                                                `businessAccess.${index}.storeId`,
                                                ''
                                            );
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select merchant" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="defaultMerchantId">
                                                No merchant
                                            </SelectItem>{' '}
                                            {/* Updated value */}
                                            {merchants.map((merchant) => (
                                                <SelectItem
                                                    key={merchant.id}
                                                    value={merchant.id}
                                                >
                                                    {merchant.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Brand</Label>
                                    <Select
                                        value={form.watch(
                                            `businessAccess.${index}.brandId`
                                        )}
                                        onValueChange={(value) => {
                                            form.setValue(
                                                `businessAccess.${index}.brandId`,
                                                value
                                            );
                                            // Reset store when brand changes
                                            form.setValue(
                                                `businessAccess.${index}.storeId`,
                                                ''
                                            );
                                        }}
                                        disabled={
                                            !form.watch(
                                                `businessAccess.${index}.merchantId`
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select brand" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="defaultBrandId">
                                                No brand
                                            </SelectItem>{' '}
                                            {/* Updated value */}
                                            {merchants
                                                .find(
                                                    (m) =>
                                                        m.id ===
                                                        form.watch(
                                                            `businessAccess.${index}.merchantId`
                                                        )
                                                )
                                                ?.brands.map((brand: any) => (
                                                    <SelectItem
                                                        key={brand.id}
                                                        value={brand.id}
                                                    >
                                                        {brand.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Store</Label>
                                    <Select
                                        value={form.watch(
                                            `businessAccess.${index}.storeId`
                                        )}
                                        onValueChange={(value) =>
                                            form.setValue(
                                                `businessAccess.${index}.storeId`,
                                                value
                                            )
                                        }
                                        disabled={
                                            !form.watch(
                                                `businessAccess.${index}.brandId`
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select store" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="defaultStoreId">
                                                No store
                                            </SelectItem>{' '}
                                            {/* Updated value */}
                                            {merchants
                                                .find(
                                                    (m) =>
                                                        m.id ===
                                                        form.watch(
                                                            `businessAccess.${index}.merchantId`
                                                        )
                                                )
                                                ?.brands.find(
                                                    (b: any) =>
                                                        b.id ===
                                                        form.watch(
                                                            `businessAccess.${index}.brandId`
                                                        )
                                                )
                                                ?.stores.map((store: any) => (
                                                    <SelectItem
                                                        key={store.id}
                                                        value={store.id}
                                                    >
                                                        {store.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {index < fields.length - 1 && <Separator />}
                        </div>
                    ))}
                    {form.formState.errors.businessAccess && (
                        <p className="text-sm text-destructive">
                            {form.formState.errors.businessAccess.message}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isPending}>
                    {isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Create User
                </Button>
            </div>
        </form>
    );
}
