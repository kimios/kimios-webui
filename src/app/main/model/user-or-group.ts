import {Group, User} from 'app/kimios-client-api';

export interface UserOrGroup {
    type: string;
    element: User | Group;
}
