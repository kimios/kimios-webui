import {Share, User as KimiosUser} from 'app/kimios-client-api';

export interface ShareWithTargetUser extends Share {
    targetUser: KimiosUser;
}

export class ShareUtils {
    public static makeShareWithTargetUser(share: Share, user: KimiosUser): ShareWithTargetUser {
        const o = share as Object;
        o['targetUser'] = user;
        return o as ShareWithTargetUser;
    }
}
