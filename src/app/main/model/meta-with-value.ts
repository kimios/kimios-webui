import {Meta} from 'app/kimios-client-api';
import {MetaValueRange} from './meta-value-range';

export interface MetaWithValue extends Meta {
    value: string | MetaValueRange | boolean;
}
