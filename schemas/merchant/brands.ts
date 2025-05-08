import * as z from 'zod';

export const brandsSearchParamsSchema = z.object({
    page: z.coerce.number().default(1),
    per_page: z.coerce.number().default(10),
    sort: z.string().optional(),
    name: z.string().optional(),
    tradingAsName: z.string().optional(),
    primaryContact: z.boolean().optional(),
    merchantId: z.string().optional(),
    status: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    operator: z.enum(['and', 'or']).optional()
});
