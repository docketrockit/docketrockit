import { auth } from '@/lib/auth';
import { LocationData } from '@/types/personal';

export type Session = typeof auth.$Infer.Session;
export type SessionType = Awaited<ReturnType<typeof auth.api.getSession>>;

export type SettingsProps = {
    userSession: SessionType | null;
    location: LocationData;
};
