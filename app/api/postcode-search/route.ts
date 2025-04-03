import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json(
            { error: "Query parameter 'q' is required" },
            { status: 400 }
        );
    }

    const apiKey = process.env.AUSPOST_API_KEY;
    const apiUrl = `https://digitalapi.auspost.com.au/postcode/search.json?q=${encodeURIComponent(query)}`;

    if (!apiKey) {
        throw new Error('API key is missing');
    }

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'auth-key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}
