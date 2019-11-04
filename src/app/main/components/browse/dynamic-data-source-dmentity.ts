import {Injectable} from '@angular/core';
import {DynamicDataSource, HasAName} from './dynamic-data-source';
import {FlatTreeControl} from '@angular/cdk/tree';
import {DynamicDatabase} from './dynamic-database';
import {DynamicFlatNodeWithUid} from './dynamic-flat-node-with-uid';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {combineLatest, from, Observable, of} from 'rxjs';
import {concatMap, tap} from 'rxjs/operators';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';

@Injectable()
export class DynamicDataSourceDMEntity extends DynamicDataSource<HasAName> {
    constructor(_treeControl: FlatTreeControl<DynamicFlatNodeWithUid>,
                _database: DynamicDatabase,
                private browseEntityService: BrowseEntityService) {
        super(_treeControl, _database);
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

            if (expand) {

                const nodes = children.map(uid =>
                    new DynamicFlatNodeWithUid(
                        (this.entities.get(uid).name != null && this.entities.get(uid).name !== undefined) ?
                            this.entities.get(uid).name :
                            '<NO_NAME>',
                        node.level + 1,
                        false,
                        true,
                        uid
                    )
                );
                this.data.splice(index + 1, 0, ...nodes);
                // notify the change
                this.dataChange.next(this.data);

                from(
                    children
                ).pipe(
                    concatMap(
                        child => combineLatest(of(child), this.browseEntityService.findContainerEntitiesAtPath(child))
                    ),
                    concatMap(
                        ([entityUid, res]) => {
                            const filtered = res.filter((e) =>
                                DMEntityUtils.dmEntityIsWorkspace(e) || DMEntityUtils.dmEntityIsFolder(e)
                            );
                            if (filtered.length > 0) {
                                filtered.forEach((e) => {
                                    this.entities.set(e.uid, e);
                                });
                                this._database.setChildren(entityUid, filtered.map(e => e.uid));
                            }
                            this.data = this.updateNodeInData(this.data, entityUid, false, (filtered.length > 0));
                            return of(filtered);
                        }
                    )
                ).subscribe();
            } else {
                let count = 0;
                for (let i = index + 1; i < this.data.length
                && this.data[i].level > node.level; i++, count++) {}
                this.data.splice(index + 1, count);
                // notify the change
                this.dataChange.next(this.data);
                node.isLoading = false;
            }



    }

    public setInitialData(): void {
        const obs: Observable<DynamicFlatNodeWithUid> = this.browseEntityService.findContainerEntitiesAtPath().pipe(
            tap(res => {
                const collection = new Array<DynamicFlatNodeWithUid>();
                res.forEach(entity => {
                    this.entities.set(entity.uid, entity);
                    this._database.addRootLevelNode(entity.uid);
                    collection.push(
                        new DynamicFlatNodeWithUid(
                            (entity.name != null && entity.name !== undefined) ?
                                entity.name :
                                '<NO_NAME>',
                            0,
                            false,
                            true,
                            entity.uid
                        ));
                });
                this.data = collection;
            }),
            concatMap(
                res =>

                    from(res).pipe(

                        concatMap(
                            entity => combineLatest(of(entity), this.browseEntityService.findContainerEntitiesAtPath(entity.uid))
                        ),
                        concatMap(
                            ([entity, res2]) => {
                                const filtered = res2.filter((e) =>
                                    DMEntityUtils.dmEntityIsWorkspace(e) || DMEntityUtils.dmEntityIsFolder(e)
                                );
                                const expandable = (filtered.length > 0);
                                filtered.forEach((e) => {
                                    this.entities.set(e.uid, e);
                                });
                                this._database.setChildren(entity.uid, filtered.map(e => e.uid));
                                this.data = this.updateNodeInData(this.data, entity.uid, false, expandable);
                                return of(

                                );
                            }
                        )
                    )
            )
        );

        const collected = new Array<DynamicFlatNodeWithUid>();
        obs.subscribe(
            res => collected.push(res),
            error => 'error',
            () => null
        );
    }

    updateNodeInData(data: DynamicFlatNodeWithUid[], uid: number, isLoading: boolean, expandable: boolean): DynamicFlatNodeWithUid[] {
        const nodeIndex = data.findIndex(node => node.uid === uid);
        const entityNode = data[nodeIndex];
        entityNode.isLoading = false;
        entityNode.expandable = expandable;
        const dataCopy = data;
        dataCopy[nodeIndex] = entityNode;

        return dataCopy;
    }
}
