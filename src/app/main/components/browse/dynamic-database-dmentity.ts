import {DynamicDatabase} from './dynamic-database';
import {DMEntity} from 'app/kimios-client-api';

export class DynamicDatabaseDMEntity extends DynamicDatabase {
    dataDMEntity = new Map<number, DMEntity>();
}
