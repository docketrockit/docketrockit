import * as z from 'zod';

export const NameSchema = z.object({
    name: z.string().min(1, {
        message: 'First name is required'
    }),
    lastName: z.string().min(1, {
        message: 'Last name is required'
    })
});

export const LocationSchema = z.object({
    country: z.string({ message: 'Country is required' }),
    region: z.optional(z.string({ message: 'Region is required' }))
});

// export const ProfilePictureSchema = z.object({
//     image: typeof window === 'undefined' ? z.any() : z.instanceof(FileList)
// });

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
const ACCEPTED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
];

export const ProfilePictureSchema = z.object({
    image: z
        .any()
        .refine((files) => files?.length === 1, 'Please select an image file.')
        .refine(
            (files) => files?.[0]?.size <= MAX_FILE_SIZE,
            'File size must be less than 2MB.'
        )
        .refine(
            (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
            'Only .jpg, .jpeg, .png, .webp and .gif formats are supported.'
        )
});
