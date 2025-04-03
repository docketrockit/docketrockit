import { Session } from '@/lib/session';
import { User } from '@/lib/user';

export interface SessionUserProps {
    session: Session;
    user: User;
}
