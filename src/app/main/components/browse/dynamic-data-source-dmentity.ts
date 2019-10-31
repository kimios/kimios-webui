import {Injectable} from '@angular/core';
import {DynamicDataSource} from './dynamic-data-source';
import {FlatTreeControl} from '@angular/cdk/tree';
import {DynamicFlatNode} from './dynamic-flat-node';
import {DynamicDatabase} from './dynamic-database';

@Injectable()
export class DynamicDataSourceDMEntity extends DynamicDataSource {
    constructor(_treeControl: FlatTreeControl<DynamicFlatNode>,
                _database: DynamicDatabase) {
        super(_treeControl, _database);
    }
}
