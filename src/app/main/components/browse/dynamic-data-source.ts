/**
 * File database, it can build a tree structured Json object from string.
 * Each node in Json object represents a file or a directory. For a file, it has filename and type.
 * For a directory, it has filename and children (a list of files or directories).
 * The input will be a json object string, and the output is a list of `FileNode` with nested
 * structure.
 */
import {Injectable} from '@angular/core';
import {BehaviorSubject, merge, Observable, of} from 'rxjs';
import {FlatTreeControl} from '@angular/cdk/tree';
import {DynamicDatabase} from './dynamic-database';
import {CollectionViewer, SelectionChange} from '@angular/cdk/collections';
import {map} from 'rxjs/operators';
import {DynamicFlatNodeWithUid} from './dynamic-flat-node-with-uid';

export interface HasAName {
    name?: string;
}

/*class ObjectWithAName implements HasAName {
    
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}*/

@Injectable()
export class DynamicDataSource<T extends HasAName> {

    dataChange = new BehaviorSubject<DynamicFlatNodeWithUid[]>([]);

    entities = new Map<number, HasAName>();

    get data(): DynamicFlatNodeWithUid[] { return this.dataChange.value; }
    set data(value: DynamicFlatNodeWithUid[]) {
        this._treeControl.dataNodes = value;
        this.dataChange.next(value);
    }

    constructor(protected _treeControl: FlatTreeControl<DynamicFlatNodeWithUid>,
                protected _database: DynamicDatabase) {
        /*this.entities.set(1, new ObjectWithAName('Fruits'));
        this.entities.set(2, new ObjectWithAName('Apple'));
        this.entities.set(3, new ObjectWithAName('Orange'));
        this.entities.set(4, new ObjectWithAName('Banana'));
        this.entities.set(5, new ObjectWithAName('Vegetables'));
        this.entities.set(6, new ObjectWithAName('Tomato'));
        this.entities.set(7, new ObjectWithAName('Potato'));
        this.entities.set(8, new ObjectWithAName('Onion'));
        this.entities.set(9, new ObjectWithAName('Fuji'));
        this.entities.set(10, new ObjectWithAName('Macintosh'));
        this.entities.set(11, new ObjectWithAName('Yellow'));
        this.entities.set(12, new ObjectWithAName('White'));
        this.entities.set(13, new ObjectWithAName('Purple'));*/

    }

    connect(collectionViewer: CollectionViewer): Observable<DynamicFlatNodeWithUid[]> {
        this._treeControl.expansionModel.changed.subscribe(change => {
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
            change.added.forEach(node => this.toggleNode(node, true).subscribe());
        }
        if (change.removed) {
            change.removed.slice().reverse().forEach(node => this.toggleNode(node, false).subscribe());
        }
    }

    /**
     * Toggle the node, remove from display list
     */
    toggleNode(node: DynamicFlatNodeWithUid, expand: boolean): Observable<number> {
        const children = this._database.getChildren(node.uid);
        const index = this.data.indexOf(node);
        if (!children || index < 0) { // If no children, or cannot find the node, no op
            return;
        }

        node.isLoading = true;

        setTimeout(() => {
            if (expand) {
                const nodes = children.map(uid =>
                    new DynamicFlatNodeWithUid(
                        (this.entities.get(uid).name != null && this.entities.get(uid).name !== undefined) ?
                            this.entities.get(uid).name :
                            '<NO_NAME>',
                        node.level + 1, this._database.isExpandable(uid),
                        false,
                        uid
                    )
                );
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

            return of();
        }, 1000);
    }

    public setInitialData(): Observable<Array<DynamicFlatNodeWithUid>> {
        this.data = this._database.rootLevelNodes.map(uid =>
            new DynamicFlatNodeWithUid(
                (this.entities.get(uid).name != null && this.entities.get(uid).name !== undefined) ?
                    this.entities.get(uid).name :
                    '<NO_NAME>',
                0,
                true,
                false,
                uid
            )
        );
        return of(this.data);
    }
}
