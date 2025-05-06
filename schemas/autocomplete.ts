import * as z from "zod";

export const AddressSchema = z.object({
    address1: z.string().min(1, "Address line 1 is required"),
    address2: z.string().optional(),
    formattedAddress: z.string().min(1, "Formatted address is required"),
    city: z.string().min(1, "City is required"),
    region: z.string().min(1, "Region is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
    lat: z.number().nonnegative(),
    lng: z.number().nonnegative()
});
