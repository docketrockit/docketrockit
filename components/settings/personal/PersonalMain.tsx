'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SettingsProps } from '@/types/settings';
import NameForm from '@/components/settings/personal/NameForm';
import LocationForm from '@/components/settings/personal/LocationForm';
import ProfilePictureForm from '@/components/settings/personal/ProfilePictureForm';

const PersonalMain = ({ userSession, location }: SettingsProps) => {
    if (!userSession) return null;

    return (
        <Card className="flex-1 transition duration-150 ease-in-out">
            <CardHeader>
                <div className="flex gap-3 items-center">
                    <div className="flex-1 text-xl text-default-700 font-bold">
                        Personal
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col w-full ">
                    <ProfilePictureForm userSession={userSession} />
                    <NameForm userSession={userSession} />
                    <LocationForm
                        countryProp={
                            location.country || location.defaultCountry!
                        }
                        regionProp={location.region || undefined}
                        countries={location.countries!}
                        regions={location.regions!}
                        initialValueProp={location.initialValueProp}
                        userSession={userSession}
                    />
                </div>
            </CardContent>
        </Card>
    );
};
export default PersonalMain;
