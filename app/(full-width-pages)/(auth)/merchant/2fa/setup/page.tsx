import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { encodeBase64 } from '@oslojs/encoding';
import { createTOTPKeyURI } from '@oslojs/otp';
import { renderSVG } from 'uqr';

import { globalGETRateLimit } from '@/lib/request';
import { getCurrentSession } from '@/lib/session';
import TwoFactorSetupForm from '@/components/auth/TwoFactorSetupForm';

export const metadata: Metadata = {
    title: 'DocketRockit | Merchant Admin | 2FA Setup',
    description: 'DocketRockit | Merchant Admin | 2FA Setup'
};

const TwoFASetupPage = async () => {
    if (!(await globalGETRateLimit())) {
        return 'Too many requests';
    }
    const { session, user } = await getCurrentSession();
    if (session === null) {
        return redirect('/merchant/login');
    }
    if (!user.emailVerified) {
        return redirect('/merchant/verify-email');
    }
    if (user.registered2FA && !session.twoFactorVerified) {
        return redirect('/merchant/2fa');
    }

    const totpKey = new Uint8Array(20);
    crypto.getRandomValues(totpKey);
    const encodedTOTPKey = encodeBase64(totpKey);
    const keyURI = createTOTPKeyURI('DocketRockit', user.email, totpKey, 30, 6);
    const qrcode = renderSVG(keyURI);
    return (
        <TwoFactorSetupForm
            encodedTOTPKey={encodedTOTPKey}
            qrcode={qrcode}
            userId={user.id}
        />
    );
};

export default TwoFASetupPage;
