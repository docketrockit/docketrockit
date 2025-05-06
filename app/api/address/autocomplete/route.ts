import { getGeolocation } from "@/utils/geolocation";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY as string;
    if (!apiKey) {
        return NextResponse.json({ error: "Missing API Key", data: null });
    }

    const { searchParams } = new URL(
        req.url,
        `http://${req.headers?.get("host")}`
    );
    // Check if your hosting provider gives you the country code
    const country = await getGeolocation();
    const input = searchParams.get("input");
    if (!input) return NextResponse.json({ error: "Error", data: null });
    const url = "https://places.googleapis.com/v1/places:autocomplete";
    // const url = "https://maps.googleapis.com/maps/api/place/autocomplete/";

    const primaryTypes = [
        "street_address",
        "subpremise",
        "route",
        "street_number",
        "landmark"
    ];

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey
            },
            body: JSON.stringify({
                input: input,
                includedPrimaryTypes: primaryTypes,
                // Location biased towards the user's country
                includedRegionCodes: [country || "AU"]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return NextResponse.json({ data: data.suggestions, error: null });
    } catch (error) {
        // console.error("Error fetching autocomplete suggestions:", error);
        return NextResponse.json({ error: error, data: null });
    }
}
