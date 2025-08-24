import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'jqjansoiljeihdzydhpg.supabase.co'
            }
        ]
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '3mb'
        }
    }
    /* config options here */
};

export default nextConfig;
