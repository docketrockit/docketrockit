import { AddressSchema } from "@/schemas/autocomplete";
import { AddressType } from "@/types/autocomplete";

/**
 * Checks if the autocomplete address is valid. Change to your own validation logic.
 * @param {AddressType} address - The address object to validate.
 * @param {string} searchInput - The search input string.
 * @returns {boolean} - Returns true if the autocomplete address is valid, otherwise false.
 */
const isValidAutocomplete = (address: AddressType, searchInput: string) => {
    if (searchInput.trim() === "") {
        return true;
    }

    const result = AddressSchema.safeParse(address);
    return result.success;
};

export default isValidAutocomplete;
