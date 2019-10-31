/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
import {DynamicFlatNode} from './dynamic-flat-node';
import {DynamicFlatNodeWithUid} from './dynamic-flat-node-with-uid';

export class DynamicDatabase {

    dataMap = new Map<number, number[]>([
        [1, [2, 3, 4]],
        [5, [6, 7, 8]],
        [2, [9, 10]],
        [8, [11, 12, 13]]
    ]);

    private _rootLevelNodes: number[] = [1, 5];

    /*/!** Initial data from database *!/
    initialData(): DynamicFlatNodeWithUid[] {
        return this._rootLevelNodes.map(name => new DynamicFlatNodeWithUid(name, 0, true));
    }*/

    get rootLevelNodes(): number[] {
        return this._rootLevelNodes;
    }

    getChildren(node: number): number[] | undefined {
        return this.dataMap.get(node);
    }

    isExpandable(node: number): boolean {
        return this.dataMap.has(node);
    }
}
