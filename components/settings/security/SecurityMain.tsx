'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SecurityProps } from '@/types/security';
import EmailForm from '@/components/settings/security/EmailForm';
import PasswordForm from '@/components/settings/security/PasswordForm';
import PhoneNumberForm from '@/components/settings/security/PhoneForm';

const SecurityMain = ({ userSession, location }: SecurityProps) => {
    if (!userSession) return null;
    const user = userSession.user;

    const hasGoogleAccount = userSession.accounts.some(
        (account) => account.providerId === 'google'
    );

    return (
        <Card className="flex-1 transition duration-150 ease-in-out">
            <CardHeader>
                <div className="flex gap-3 items-center">
                    <div className="flex-1 text-xl text-default-700 font-bold">
                        Security
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col w-full">
                    <EmailForm userSession={userSession} />
                    <PhoneNumberForm
                        userSession={userSession}
                        defaultCountry={location.defaultCountry}
                    />
                    <PasswordForm userSession={userSession} />
                </div>
            </CardContent>
        </Card>
    );
};
export default SecurityMain;
