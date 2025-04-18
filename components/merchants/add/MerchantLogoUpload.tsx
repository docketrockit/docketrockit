'use client';

import * as z from 'zod';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Upload } from 'lucide-react';

import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MerchantSchema } from '@/schemas/merchants';

const MerchantLogoUpload = () => {
    const form = useFormContext<z.infer<typeof MerchantSchema>>();
    const maxFiles = 1;
    const {
        fields: imageFields,
        append: appendImage,
        remove: removeImage
    } = useFieldArray({
        name: 'logoUrl',
        control: form.control
    });

    // const onDrop = (acceptedFiles: File[]) => {
    //     console.log('Files dropped:', acceptedFiles);
    //     // Handle file uploads here
    // };

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            if (imageFields.length + acceptedFiles.length <= maxFiles) {
                appendImage(acceptedFiles.map((file) => ({ value: file })));
                await form.trigger('logoUrl');
            } else {
                toast.error('Too many files', {
                    description: 'You have uploaded too many files'
                });
            }
        },
        [form]
    );

    // const { getRootProps, getInputProps, isDragActive } = useDropzone({
    //     onDrop,
    //     accept: {
    //         'image/png': [],
    //         'image/jpeg': [],
    //         'image/webp': [],
    //         'image/svg+xml': []
    //     }
    // });

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragReject,
        fileRejections,
        open
    } = useDropzone({
        onDrop,
        maxFiles,
        maxSize: 5 * 1024 * 1024,
        accept: {
            'image/jpeg': [],
            'image/jpg': [],
            'image/png': [],
            'image/webp': []
        }
    });

    useEffect(() => {
        if (fileRejections.length > 0) {
            const errorType = fileRejections[0].errors[0].code;
            if (errorType === 'file-invalid-type') {
                toast.error('Wrong file type', {
                    description: 'Please upload a file with the correct format'
                });
            } else if (errorType === 'file-too-large') {
                toast.error('File too large', {
                    description: 'Please upload a file with the correct size'
                });
            } else if (errorType === 'too-many-files') {
                toast.error('Too many files', {
                    description: 'You have uploaded too many files'
                });
            } else {
                toast.error('Uh oh! Something went wrong.', {
                    description:
                        'There was a problem with your request. Please try again'
                });
            }
        }
    }, [fileRejections]);

    return (
        <>
            <FormField
                control={form.control}
                name="logoUrl"
                render={() => (
                    <FormItem className={cn('w-full')}>
                        <FormControl>
                            <div
                                className={cn(
                                    `transition border border-gray-300 border-dashed cursor-pointer dark:hover:border-brand-500 dark:border-gray-700 rounded-xl hover:border-brand-500`,
                                    {
                                        'border-green-500 bg-green-500/10':
                                            isDragActive && !isDragReject,
                                        'border-destructive bg-destructive/10':
                                            isDragActive && isDragReject,
                                        'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900':
                                            !isDragActive
                                    }
                                )}
                                {...getRootProps()}
                            >
                                <input {...getInputProps()} id="logoUrl" />
                                {imageFields.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10">
                                        <div className="mb-[22px] flex justify-center">
                                            <div
                                                className={cn(
                                                    `flex h-[68px] w-[68px]  items-center justify-center rounded-full`,
                                                    {
                                                        'border-green-500 bg-green-500/30':
                                                            isDragActive &&
                                                            !isDragReject,
                                                        'border-destructive bg-destructive/30':
                                                            isDragActive &&
                                                            isDragReject,
                                                        'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400':
                                                            !isDragActive
                                                    }
                                                )}
                                            >
                                                <Upload className="size-8" />
                                            </div>
                                        </div>
                                        <h4 className="mb-3 font-semibold text-gray-800 text-theme-xl dark:text-white/90">
                                            {isDragActive
                                                ? 'Drop Files Here'
                                                : 'Drag & Drop Files Here'}
                                        </h4>

                                        <span className=" text-center mb-5 block w-full max-w-[290px] text-sm text-gray-700 dark:text-gray-400">
                                            Drag and drop your PNG, JPG or WebP
                                            images here or browse
                                        </span>

                                        <span className="font-medium underline text-theme-sm text-brand-500">
                                            Browse File
                                        </span>
                                        {/* <div className="mb-2 mt-4">
                                            Drop or{' '}
                                            <span
                                                onClick={() => open()}
                                                className="cursor-pointer text-primary hover:underline"
                                            >
                                                select
                                            </span>
                                        </div>
                                        <span
                                            className={cn(
                                                'absolute bottom-2 left-1/2 -translate-x-1/2 text-xs',
                                                {
                                                    'text-destructive':
                                                        isDragReject ||
                                                        fileRejections.length >
                                                            0,
                                                    'text-muted-foreground':
                                                        !isDragReject &&
                                                        !(
                                                            fileRejections.length >
                                                            0
                                                        )
                                                }
                                            )}
                                        >
                                            Max size: 5MB, JPG or PNG
                                        </span> */}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 mx-8">
                                        <div className="mt-2 grid grid-cols-5 gap-2 justify-center">
                                            <div></div>
                                            <div></div>
                                            {imageFields.map((field, index) => (
                                                <div
                                                    key={field.id}
                                                    className="space-y-2"
                                                >
                                                    <Image
                                                        src={URL.createObjectURL(
                                                            field.value
                                                        )}
                                                        alt="Brewery Logo"
                                                        width="0"
                                                        height="0"
                                                        sizes="100vw"
                                                        className="h-auto w-full"
                                                        priority={true}
                                                    />
                                                    <Button
                                                        variant="destructive"
                                                        onClick={(e) => {
                                                            removeImage(index);
                                                            e.stopPropagation();
                                                        }}
                                                        type="button"
                                                        className="w-full"
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </FormControl>
                    </FormItem>
                )}
            />
        </>
    );
};

export default MerchantLogoUpload;
