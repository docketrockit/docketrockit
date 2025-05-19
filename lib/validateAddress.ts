// lib/validateAddress.ts

type AddressInput = {
    address1: string;
    address2?: string;
    city: string;
    region: string;
    postalCode: string;
    country: string; // Must be 2-letter ISO (e.g., AU, US)
};

export async function validateAddress(input: AddressInput) {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY as string;
    if (!apiKey) throw new Error('Missing Google API key');

    const requestBody = {
        address: {
            addressLines: [input.address1, input.address2].filter(Boolean),
            locality: input.city,
            administrativeArea: input.region,
            postalCode: input.postalCode,
            regionCode: input.country.toUpperCase() // Ensure it's a 2-letter country code
        }
    };

    const response = await fetch(
        `https://addressvalidation.googleapis.com/v1:validateAddress?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        }
    );

    const result = await response.json();

    if (!response.ok) {
        const error = await response.json();
        console.error('Google Address Validation Error:', error);
        throw new Error(
            error.error?.message || 'Unknown error from Google API'
        );
    }

    const {
        result: { verdict, address }
    } = result;

    return {
        isValid:
            !verdict.hasUnconfirmedComponents &&
            !verdict.hasReplacedComponents &&
            !verdict.hasInferredComponents,
        verdict,
        formattedAddress: address.formattedAddress,
        postalAddress: address.postalAddress
    };
}
