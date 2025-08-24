import { auth } from '@/lib/auth';

export type Session = typeof auth.$Infer.Session;
export type SessionType = Awaited<ReturnType<typeof auth.api.getSession>>;

export type SessionProps = {
    userSession: SessionType | null;
};

export type SessionNavProps = {
    user: NonNullable<SessionType>['user'];
};

export type User = NonNullable<SessionType>['user'];
