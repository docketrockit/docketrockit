'use client';

import { useState } from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    AlarmClock,
    BadgeDollarSign,
    MessageSquareDot,
    Settings2,
    ShieldCheck,
    UserCircle
} from 'lucide-react';
import { SettingsProps } from '@/types/settings';
import PersonalMain from '@/components/settings/personal/PersonalMain';
import SecurityMain from '@/components/settings/security/SecurityMain';

const SettingsMain = ({ userSession, location }: SettingsProps) => {
    const [tab, setTab] = useState('personal');

    return (
        <>
            <Card className="w-80">
                <CardHeader>
                    <div className="flex gap-3 items-center">
                        <div className="flex-1 text-xl text-default-700 font-bold">
                            Settings
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ul className="list-none w-full">
                        <li className="w-full">
                            <button
                                className={`cursor-pointer w-full border-0 justify-start text-base py-2.5 px-5  flex flex-row space-x-2 font-medium rounded-3xl transition duration-150 ease-in-out ${tab === 'personal' ? 'bg-primary-500 text-blue-600' : 'bg-none hover:bg-primary-50 text-primary'}`}
                                onClick={() => setTab('personal')}
                            >
                                <UserCircle />
                                <div>Personal</div>
                            </button>
                        </li>
                        <li className="w-full">
                            <button
                                className={`cursor-pointer w-full border-0 justify-start text-base py-2.5 px-5  flex flex-row space-x-2 font-medium rounded-3xl transition duration-150 ease-in-out ${tab === 'security' ? 'bg-primary-500 text-blue-600' : 'bg-none hover:bg-primary-50 text-primary'}`}
                                onClick={() => setTab('security')}
                            >
                                <ShieldCheck />
                                <div>Security</div>
                            </button>
                        </li>
                        <li className="w-full">
                            <button
                                className={`cursor-pointer w-full border-0 justify-start text-base py-2.5 px-5  flex flex-row space-x-2 font-medium rounded-3xl transition duration-150 ease-in-out ${tab === 'preferences' ? 'bg-primary-500 text-blue-600' : 'bg-none hover:bg-primary-50 text-primary'}`}
                                onClick={() => setTab('preferences')}
                            >
                                <Settings2 />
                                <div>Preferences</div>
                            </button>
                        </li>
                        <li className="w-full">
                            <button
                                className={`cursor-pointer w-full border-0 justify-start text-base py-2.5 px-5  flex flex-row space-x-2 font-medium rounded-3xl transition duration-150 ease-in-out ${tab === 'notifications' ? 'bg-primary-500 text-blue-600' : 'bg-none hover:bg-primary-50 text-primary'}`}
                                onClick={() => setTab('notifications')}
                            >
                                <MessageSquareDot />
                                <div>Notifications</div>
                            </button>
                        </li>
                        <li className="w-full">
                            <button
                                className={`cursor-pointer w-full border-0 justify-start text-base py-2.5 px-5  flex flex-row space-x-2 font-medium rounded-3xl transition duration-150 ease-in-out ${tab === 'payments' ? 'bg-primary-500 text-blue-600' : 'bg-none hover:bg-primary-50 text-primary'}`}
                                onClick={() => setTab('payments')}
                            >
                                <BadgeDollarSign />
                                <div>Payments</div>
                            </button>
                        </li>
                        <li className="w-full">
                            <button
                                className={`cursor-pointer w-full border-0 justify-start text-base py-2.5 px-5  flex flex-row space-x-2 font-medium rounded-3xl transition duration-150 ease-in-out ${tab === 'activity' ? 'bg-primary-500 text-blue-600' : 'bg-none hover:bg-primary-50 text-primary'}`}
                                onClick={() => setTab('activity')}
                            >
                                <AlarmClock />
                                <div>Activity</div>
                            </button>
                        </li>
                    </ul>
                </CardContent>
            </Card>

            {tab === 'personal' && (
                <PersonalMain userSession={userSession} location={location} />
            )}
            {tab === 'security' && (
                <SecurityMain userSession={userSession} location={location} />
            )}
        </>
    );
};
export default SettingsMain;
