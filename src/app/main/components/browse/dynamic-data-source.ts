/**
 * File database, it can build a tree structured Json object from string.
 * Each node in Json object represents a file or a directory. For a file, it has filename and type.
 * For a directory, it has filename and children (a list of files or directories).
 * The input will be a json object string, and the output is a list of `FileNode` with nested
 * structure.
 */
import {Injectable} from '@angular/core';
import {BehaviorSubject, merge, Observable} from 'rxjs';
import {FlatTreeControl} from '@angular/cdk/tree';
import {DynamicDatabase} from './dynamic-database';
import {CollectionViewer, SelectionChange} from '@angular/cdk/collections';
import {map} from 'rxjs/operators';
import {DynamicFlatNodeWithUid} from './dynamic-flat-node-with-uid';

@Injectable()
export class DynamicDataSource {

    dataChange = new BehaviorSubject<DynamicFlatNodeWithUid[]>([]);

    entities = new Map<number, string>();

    get data(): DynamicFlatNodeWithUid[] { return this.dataChange.value; }
    set data(value: DynamicFlatNodeWithUid[]) {
        this._treeControl.dataNodes = value;
        this.dataChange.next(value);
    }

    constructor(private _treeControl: FlatTreeControl<DynamicFlatNodeWithUid>,
                protected _database: DynamicDatabase) {
        this.entities.set(1, 'Fruits');
        this.entities.set(2, 'Apple');
        this.entities.set(3, 'Orange');
        this.entities.set(4, 'Banana');
        this.entities.set(5, 'Vegetables');
        this.entities.set(6, 'Tomato');
        this.entities.set(7, 'Potato');
        this.entities.set(8, 'Onion');
        this.entities.set(9, 'Fuji');
        this.entities.set(10, 'Macintosh');
        this.entities.set(11, 'Yellow');
        this.entities.set(12, 'White');
        this.entities.set(13, 'Purple');

    }

    connect(collectionViewer: CollectionViewer): Observable<DynamicFlatNodeWithUid[]> {
        this._treeControl.expansionModel.onChange.subscribe(change => {
            if ((change as SelectionChange<DynamicFlatNodeWithUid>).added ||
                (change as SelectionChange<DynamicFlatNodeWithUid>).removed) {
                this.handleTreeControl(change as SelectionChange<DynamicFlatNodeWithUid>);
            }
        });

        return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
    }

    /** Handle expand/collapse behaviors */
    handleTreeControl(change: SelectionChange<DynamicFlatNodeWithUid>): void {
        if (change.added) {
            change.added.forEach(node => this.toggleNode(node, true));
        }
        if (change.removed) {
            change.removed.slice().reverse().forEach(node => this.toggleNode(node, false));
        }
    }

    /**
     * Toggle the node, remove from display list
     */
    toggleNode(node: DynamicFlatNodeWithUid, expand: boolean): void {
        const children = this._database.getChildren(node.uid);
        const index = this.data.indexOf(node);
        if (!children || index < 0) { // If no children, or cannot find the node, no op
            return;
        }

        node.isLoading = true;

        setTimeout(() => {
            if (expand) {
                const nodes = children.map(uid =>
                    new DynamicFlatNodeWithUid(this.entities.get(uid), node.level + 1, this._database.isExpandable(uid), false, uid));
                this.data.splice(index + 1, 0, ...nodes);
            } else {
                let count = 0;
                for (let i = index + 1; i < this.data.length
                && this.data[i].level > node.level; i++, count++) {}
                this.data.splice(index + 1, count);
            }

            // notify the change
            this.dataChange.next(this.data);
            node.isLoading = false;
        }, 1000);
    }

    setInitialData(): void {
        this.data = this._database.rootLevelNodes.map(uid => new DynamicFlatNodeWithUid(this.entities.get(uid), 0, true, false, uid));
    }
}
