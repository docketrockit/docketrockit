'use client';

import React from 'react';
import type { ReactElement } from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddUserForm } from './AddUserForm';
import { EditUserForm } from './EditUserForm';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from '@/components/ui/sheet';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { useMobile } from '@/hooks/useMobile';
import type { UserWithDetails, AdminUser } from '@/types/adminUser';
import { getUserById } from '@/actions/admin/adminUsers';

interface UserManagementWrapperProps {
    children: ReactElement<{ onEditUser?: (user: AdminUser) => void }>;
}

export function UserManagementWrapper({
    children
}: UserManagementWrapperProps) {
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserWithDetails | null>(
        null
    );
    const [isLoadingUser, setIsLoadingUser] = useState(false);
    const isMobile = useMobile();

    useEffect(() => {
        const handleEditUser = async (event: CustomEvent<AdminUser>) => {
            setIsLoadingUser(true);
            try {
                const fullUser = await getUserById(event.detail.id);
                if (fullUser) {
                    setEditingUser(fullUser);
                }
            } catch (error) {
                console.error('Failed to load user for editing:', error);
            } finally {
                setIsLoadingUser(false);
            }
        };

        window.addEventListener('editUser' as any, handleEditUser);
        return () =>
            window.removeEventListener('editUser' as any, handleEditUser);
    }, []);

    const handleAddUserSuccess = () => {
        setIsAddUserOpen(false);
        // Refresh the page to show the new user
        window.location.reload();
    };

    const handleEditUserSuccess = () => {
        setEditingUser(null);
        // Refresh the page to show the updated user
        window.location.reload();
    };

    const handleEditUser = (user: AdminUser) => {
        window.dispatchEvent(new CustomEvent('editUser', { detail: user }));
    };

    const AddUserTrigger = (
        <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add User
        </Button>
    );

    const AddUserContent = (
        <>
            <SheetHeader className="mb-6">
                <SheetTitle>Add New User</SheetTitle>
            </SheetHeader>
            <div className="max-h-[80vh] overflow-y-auto pr-2">
                <AddUserForm
                    onSuccess={handleAddUserSuccess}
                    onCancel={() => setIsAddUserOpen(false)}
                />
            </div>
        </>
    );

    return (
        <div>
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Admin Users
                        </h1>
                        <p className="text-muted-foreground">
                            Manage admin users, their permissions, and access
                            levels
                        </p>
                    </div>

                    {/* Add User Button with responsive Sheet/Dialog */}
                    {isMobile ? (
                        <Dialog
                            open={isAddUserOpen}
                            onOpenChange={setIsAddUserOpen}
                        >
                            <DialogTrigger asChild>
                                {AddUserTrigger}
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Add New User</DialogTitle>
                                </DialogHeader>
                                <AddUserForm
                                    onSuccess={handleAddUserSuccess}
                                    onCancel={() => setIsAddUserOpen(false)}
                                />
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <Sheet
                            open={isAddUserOpen}
                            onOpenChange={setIsAddUserOpen}
                        >
                            <SheetTrigger asChild>
                                {AddUserTrigger}
                            </SheetTrigger>
                            <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
                                {AddUserContent}
                            </SheetContent>
                        </Sheet>
                    )}
                </div>

                {React.cloneElement(children, { onEditUser: handleEditUser })}
            </div>

            {/* Edit User Sheet/Dialog */}
            {editingUser && (
                <>
                    {isMobile ? (
                        <Dialog
                            open={!!editingUser}
                            onOpenChange={() => setEditingUser(null)}
                        >
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Edit User</DialogTitle>
                                </DialogHeader>
                                <EditUserForm
                                    user={editingUser}
                                    onSuccess={handleEditUserSuccess}
                                    onCancel={() => setEditingUser(null)}
                                />
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <Sheet
                            open={!!editingUser}
                            onOpenChange={() => setEditingUser(null)}
                        >
                            <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
                                <SheetHeader className="mb-6">
                                    <SheetTitle>Edit User</SheetTitle>
                                </SheetHeader>
                                <div className="max-h-[80vh] overflow-y-auto pr-2">
                                    <EditUserForm
                                        user={editingUser}
                                        onSuccess={handleEditUserSuccess}
                                        onCancel={() => setEditingUser(null)}
                                    />
                                </div>
                            </SheetContent>
                        </Sheet>
                    )}
                </>
            )}

            {isLoadingUser && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">
                            Loading user details...
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
