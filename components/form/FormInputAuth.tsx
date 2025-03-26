'use client';
import { forwardRef } from 'react';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type FormInputProps = {
    name: string;
    type: string;
    label?: string;
    defaultValue?: string;
};

export const FormInputAuth = forwardRef<HTMLInputElement, FormInputProps>(
    function FormInputAuth({ label, name, type, defaultValue, ...props }, ref) {
        return (
            <>
                <Input
                    type={type}
                    placeholder={label}
                    name={name}
                    {...props}
                    className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-11"
                />
            </>
        );
    }
);
