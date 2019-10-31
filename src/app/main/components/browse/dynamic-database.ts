/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
import {DynamicFlatNode} from './dynamic-flat-node';

export class DynamicDatabase {
    dataMap = new Map<number, number[]>();

    /** Initial data from database */
    initialData(uidAndNamesMap: Map<number, string>): DynamicFlatNode[] {
        const initialData = new Array<DynamicFlatNode>();
        uidAndNamesMap.forEach((value, key) => initialData.push(new DynamicFlatNode(value, key, 0, true)));
        return initialData;
    }

    getChildren(node: number): number[] | undefined {
        return this.dataMap.get(node);
    }

    isExpandable(node: number): boolean {
        return this.dataMap.has(node);
    }
}
