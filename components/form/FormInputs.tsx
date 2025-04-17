'use client';

import { forwardRef, useState } from 'react';
import { LucideIcon, Eye, EyeOff } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type FormInputProps = {
    name: string;
    type: string;
    label?: string;
    defaultValue?: string;
    icon?: LucideIcon;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const FormInputIcon = forwardRef<HTMLInputElement, FormInputProps>(
    function FormInputAuth(
        { label, name, type, defaultValue, icon: Icon = Eye, ...props },
        ref
    ) {
        return (
            <div className="relative">
                <div className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">
                    <Icon className="h-4 w-4" />
                </div>
                <Input
                    type={type}
                    placeholder={label}
                    className="w-full rounded-lg bg-background pl-10"
                    {...props}
                />
            </div>
        );
    }
);

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    function FormInputAuth(
        {
            label,
            name,
            type,
            defaultValue,
            icon: Icon = Eye,
            onChange,
            value,
            ...props
        },
        ref
    ) {
        return (
            <div className="relative">
                <Input
                    type={type}
                    placeholder={label}
                    className="w-full rounded-lg bg-background h-12 pl-3"
                    onChange={onChange}
                    value={value}
                    defaultValue={defaultValue}
                    {...props}
                />
            </div>
        );
    }
);

export const FormInputIconPassword = forwardRef<
    HTMLInputElement,
    FormInputProps
>(function FormInputAuth(
    { label, name, type, defaultValue, icon: Icon = Eye, ...props },
    ref
) {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <div className="relative">
            <div className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">
                <Icon className="h-4 w-4" />
            </div>
            <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={label}
                className="w-full rounded-lg bg-background pl-10"
                {...props}
            />
            <div
                className="absolute inset-y-0 right-0 flex items-center pl-3"
                tabIndex={-1}
            >
                <Button
                    type="button"
                    variant="link"
                    onClick={() => {
                        setShowPassword((prev) => !prev);
                    }}
                >
                    {showPassword ? (
                        <Eye className="size-5" />
                    ) : (
                        <EyeOff className="size-5" />
                    )}
                </Button>
            </div>
        </div>
    );
});
