import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    formatAccessLevel,
    formatStatus,
    getStatusColor
} from '@/utils/format';
import type { UserWithDetails } from '@/types/adminUser';
import {
    CalendarDays,
    Mail,
    Phone,
    MapPin,
    User,
    Shield,
    Building,
    Clock
} from 'lucide-react';

interface UserProfileProps {
    user: UserWithDetails;
}

export function UserProfile({ user }: UserProfileProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Personal Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3">
                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Email</p>
                                <p className="text-sm text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        {user.phoneNumber && (
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Phone Number
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {user.phoneNumber}
                                    </p>
                                </div>
                            </div>
                        )}

                        {(user.country || user.region) && (
                            <div className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Location
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {user.country?.name}
                                        {user.region && `, ${user.region.name}`}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Created</p>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(
                                        user.createdAt
                                    ).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        {user.createdBy && (
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Created By
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {user.createdBy.name}{' '}
                                        {user.createdBy.lastName}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Account Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3">
                        <div>
                            <p className="text-sm font-medium mb-2">Status</p>
                            <Badge
                                variant="outline"
                                className={getStatusColor(user.status)}
                            >
                                {formatStatus(user.status)}
                            </Badge>
                        </div>

                        <div>
                            <p className="text-sm font-medium mb-2">Roles</p>
                            <div className="flex flex-wrap gap-1">
                                {user.role.map((role) => (
                                    <Badge key={role} variant="secondary">
                                        {role}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="font-medium">Email Verified</p>
                                <p className="text-muted-foreground">
                                    {user.emailVerified ? 'Yes' : 'No'}
                                </p>
                            </div>
                            <div>
                                <p className="font-medium">Phone Verified</p>
                                <p className="text-muted-foreground">
                                    {user.phoneVerified ? 'Yes' : 'No'}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium">Last Updated</p>
                            <p className="text-sm text-muted-foreground">
                                {new Date(user.updatedAt).toLocaleDateString(
                                    'en-US',
                                    {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }
                                )}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Business Access */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Business Access & Permissions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {user.businessAccess.length === 0 ? (
                        <p className="text-muted-foreground">
                            No business access configured
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {user.businessAccess.map((access, index) => (
                                <div key={access.id}>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">
                                                    {formatAccessLevel(
                                                        access.accessLevel
                                                    )}
                                                </Badge>
                                                {access.jobTitle && (
                                                    <Badge variant="secondary">
                                                        {access.jobTitle}
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="text-sm space-y-1">
                                                {access.merchant && (
                                                    <p>
                                                        <span className="font-medium">
                                                            Merchant:
                                                        </span>{' '}
                                                        {access.merchant.name}
                                                    </p>
                                                )}
                                                {access.brand && (
                                                    <p>
                                                        <span className="font-medium">
                                                            Brand:
                                                        </span>{' '}
                                                        {access.brand.name}
                                                    </p>
                                                )}
                                                {access.store && (
                                                    <p>
                                                        <span className="font-medium">
                                                            Store:
                                                        </span>{' '}
                                                        {access.store.name}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium mb-1">
                                                    Permissions:
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {access.permissions.map(
                                                        (permission) => (
                                                            <Badge
                                                                key={permission}
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                {permission.replace(
                                                                    '_',
                                                                    ' '
                                                                )}
                                                            </Badge>
                                                        )
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Created{' '}
                                                    {new Date(
                                                        access.createdAt
                                                    ).toLocaleDateString()}
                                                </div>
                                                <div>
                                                    Status:{' '}
                                                    {access.isActive
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {index < user.businessAccess.length - 1 && (
                                        <Separator className="mt-4" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
