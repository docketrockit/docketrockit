import * as z from 'zod';

export const brandStoresSearchParamsSchema = z.object({
    page: z.coerce.number().default(1),
    per_page: z.coerce.number().default(10),
    sort: z.string().optional(),
    name: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    brandId: z.string().optional(),
    status: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    operator: z.enum(['and', 'or']).optional()
});
