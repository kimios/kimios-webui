import {Meta} from 'app/kimios-client-api';

export interface MetaWithValue extends Meta {
    value: Array<string> | number | string;
}
