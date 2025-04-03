import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { sessionToken, expiresAt } = await req.json();

        if (!sessionToken || !expiresAt) {
            return NextResponse.json(
                { error: 'Invalid request' },
                { status: 400 }
            );
        }

        const cookieStore = await cookies();

        cookieStore.set('passwordResetToken', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires: new Date(expiresAt),
            path: '/'
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to set cookie' },
            { status: 500 }
        );
    }
}
