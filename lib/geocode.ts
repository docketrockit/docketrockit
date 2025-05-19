// lib/geocode.ts
export async function geocodeAddress(fullAddress: string) {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY as string;
    const encodedAddress = encodeURIComponent(fullAddress);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to call Google Geocoding API');

    const data = await res.json();
    const result = data.results?.[0];

    if (!result) {
        throw new Error('Address not found');
    }

    return {
        formattedAddress: result.formatted_address,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng
    };
}
