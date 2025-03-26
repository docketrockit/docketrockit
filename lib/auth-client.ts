import { createAuthClient } from 'better-auth/react';
import { adminClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
    /** the base url of the server (optional if you're using the same domain) */
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
    plugins: [adminClient()]
});
