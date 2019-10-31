import {Injectable} from '@angular/core';
import {DynamicDataSource} from './dynamic-data-source';
import {FlatTreeControl} from '@angular/cdk/tree';
import {DynamicDatabase} from './dynamic-database';
import {DynamicFlatNodeWithUid} from './dynamic-flat-node-with-uid';

@Injectable()
export class DynamicDataSourceDMEntity extends DynamicDataSource {
    constructor(_treeControl: FlatTreeControl<DynamicFlatNodeWithUid>,
                _database: DynamicDatabase) {
        super(_treeControl, _database);
    }
}
