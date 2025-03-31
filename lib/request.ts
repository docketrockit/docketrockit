import { headers } from 'next/headers';

import { RefillingTokenBucket } from './rate-limit';

export const globalBucket = new RefillingTokenBucket<string>(100, 1);

export const globalGETRateLimit = async (): Promise<boolean> => {
    const headerStore = await headers();
    // Note: Assumes X-Forwarded-For will always be defined.
    const clientIP = headerStore.get('X-Forwarded-For');
    if (clientIP === null) {
        return true;
    }
    return globalBucket.consume(clientIP, 1);
};

export const globalPOSTRateLimit = async (): Promise<boolean> => {
    const headerStore = await headers();
    // Note: Assumes X-Forwarded-For will always be defined.
    const clientIP = headerStore.get('X-Forwarded-For');
    if (clientIP === null) {
        return true;
    }
    return globalBucket.consume(clientIP, 3);
};
