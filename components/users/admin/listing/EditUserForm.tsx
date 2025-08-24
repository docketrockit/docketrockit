'use client';

import { z } from 'zod';
import { useEffect, useState, useTransition } from 'react';
import { Status, UserRole, AccessLevel, Permission } from '@prisma/client';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
    updateUser,
    getMerchants,
    getCountries
} from '@/actions/admin/adminUsers';
import type { UserWithDetails } from '@/types/adminUser';

const editUserSchema = z.object({
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
    businessAccess: z.array(
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
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface EditUserFormProps {
    user: UserWithDetails;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function EditUserForm({ user, onSuccess, onCancel }: EditUserFormProps) {
    const [isPending, startTransition] = useTransition();
    const [countries, setCountries] = useState<any[]>([]);
    const [merchants, setMerchants] = useState<any[]>([]);

    const form = useForm<EditUserFormData>({
        resolver: zodResolver(editUserSchema),
        defaultValues: {
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber || '',
            countryId: user.countryId || '',
            regionId: user.regionId || '',
            role: user.role,
            status: user.status,
            businessAccess: user.businessAccess.map((access) => ({
                accessLevel: access.accessLevel,
                permissions: access.permissions,
                merchantId: access.merchantId || '',
                brandId: access.brandId || '',
                storeId: access.storeId || '',
                jobTitle: access.jobTitle || ''
            }))
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

    const onSubmit = (data: EditUserFormData) => {
        startTransition(async () => {
            const result = await updateUser({
                id: user.id,
                ...data
            });

            if (result.success) {
                toast.success('User updated successfully');
                onSuccess?.();
            } else {
                toast.error(result.error || 'Failed to update user');
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
                            <Label htmlFor="name">First Name</Label>
                            <Input id="name" {...form.register('name')} />
                            {form.formState.errors.name && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.name.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
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
                        <Label htmlFor="email">Email</Label>
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
                        <Label>Status</Label>
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
                        <Label>Roles</Label>
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
                        Business Access
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                append({
                                    accessLevel: AccessLevel.STORE,
                                    permissions: [Permission.READ],
                                    merchantId: '',
                                    brandId: '',
                                    storeId: '',
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
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => remove(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Access Level</Label>
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
                                <Label>Permissions</Label>
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
                            </div>

                            {index < fields.length - 1 && <Separator />}
                        </div>
                    ))}
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
                    Update User
                </Button>
            </div>
        </form>
    );
}
