/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
import {DynamicFlatNode} from './dynamic-flat-node';

export class DynamicDatabase {
    dataMap = new Map<string, string[]>();

    rootLevelNodes: string[] = ['Fruits', 'Vegetables'];

    /** Initial data from database */
    initialData(): DynamicFlatNode[] {
        return this.rootLevelNodes.map(name => new DynamicFlatNode(name, 0, true));
    }

    getChildren(node: string): string[] | undefined {
        return this.dataMap.get(node);
    }

    isExpandable(node: string): boolean {
        return this.dataMap.has(node);
    }
}
