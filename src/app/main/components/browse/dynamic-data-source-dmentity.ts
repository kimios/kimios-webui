import {Injectable} from '@angular/core';
import {DynamicDataSource, HasAName} from './dynamic-data-source';
import {FlatTreeControl} from '@angular/cdk/tree';
import {DynamicDatabase} from './dynamic-database';
import {DynamicFlatNodeWithUid} from './dynamic-flat-node-with-uid';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {combineLatest, EMPTY, from, Observable, of} from 'rxjs';
import {concatMap, expand, map, mergeMap, tap, toArray} from 'rxjs/operators';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {DMEntity} from 'app/kimios-client-api';

@Injectable()
export class DynamicDataSourceDMEntity extends DynamicDataSource<HasAName> {
    loadedEntities: number[];
    entityId: number;

    constructor(_treeControl: FlatTreeControl<DynamicFlatNodeWithUid>,
                _database: DynamicDatabase,
                private browseEntityService: BrowseEntityService,
    ) {
        super(_treeControl, _database);
        this.loadedEntities = [];
        this.entityId = -1;
    }

    /**
     * Toggle the node, remove from display list
     */
    toggleNode(node: DynamicFlatNodeWithUid, doExpand: boolean): Observable<number> {
        const children = this._database.getChildren(node.uid);
        const index = this.data.indexOf(node);
        if (!children || index < 0) { // If no children, or cannot find the node, no op
            return;
        }

        let obs;
            if (doExpand) {

                const nodes = children.map(uid =>
                    new DynamicFlatNodeWithUid(
                        (this.entities.get(uid).name != null && this.entities.get(uid).name !== undefined) ?
                            this.entities.get(uid).name :
                            '<NO_NAME>',
                        node.level + 1,
                        this.loadedEntities.includes(uid)
                        && this._database.getChildren(uid) !== null
                        && this._database.getChildren(uid) !== undefined
                        && this._database.getChildren(uid).length > 0,
                        ! this.loadedEntities.includes(uid),
                        uid
                    )
                );
                this.data.splice(index + 1, 0, ...nodes);
                // notify the change
                this.dataChange.next(this.data);

                obs = from(
                    children.filter(uid => ! this.loadedEntities.includes(uid))
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
                            this.loadedEntities.push(entityUid);
                            return of(entityUid);
                        }
                    )
                );
            } else {
                let count = 0;
                for (let i = index + 1; i < this.data.length
                && this.data[i].level > node.level; i++, count++) {}
                this.data.splice(index + 1, count);
                // notify the change
                this.dataChange.next(this.data);
                node.isLoading = false;
                obs = of();
            }

        return obs;

    }

    public setInitialData(): Observable<Array<DynamicFlatNodeWithUid>> {
        return this.retrieveNodes().pipe(
            toArray()
        );
    }

    private retrieveNodes(): Observable<DynamicFlatNodeWithUid> {
        return this.browseEntityService.findContainerEntitiesAtPath().pipe(
            tap(res => {
                const collection = new Array<DynamicFlatNodeWithUid>();
                res.forEach(entity => {
                    this.entities.set(entity.uid, entity);
                    this._database.addRootLevelNode(entity.uid);
                    this.loadedEntities.push(entity.uid);
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

                        mergeMap(
                            entity => combineLatest(of(entity), this.browseEntityService.findContainerEntitiesAtPath(entity.uid))
                        ),
                        map(
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
                                this.loadedEntities.push(entity.uid);
                                return new DynamicFlatNodeWithUid(
                                    (entity.name != null && entity.name !== undefined) ?
                                        entity.name :
                                        '<NO_NAME>',
                                    0,
                                    false,
                                    true,
                                    entity.uid
                                );
                            }
                        )
                    )
            )
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

    constructDynamicNodeFromDMEntity(entity: DMEntity): DynamicFlatNodeWithUid {
        return new DynamicFlatNodeWithUid(
            (entity.name != null && entity.name !== undefined) ?
                entity.name :
                '<NO_NAME>',
            0,
            false,
            true,
            entity.uid
        );
    }

    loadChildrenNodesDataInDatabase(entity: DMEntity): Observable<Array<DMEntity>> {
        return this.browseEntityService.findContainerEntitiesAtPath(entity.uid).pipe(
            tap(res => {
                this._database.setChildren(entity.uid, res.map(ent => ent.uid));
                res.forEach(entity1 => {
                    this.entities.set(entity1.uid, entity1);
                    this.loadedEntities.push(entity1.uid);
                });
            })
        );
    }

    loadChildrenNodesDataInDatabaseReturnTodo(entities: Array<DMEntity>): Observable<{ next: Array<DMEntity>; done: DMEntity }> {
        const entity = entities.shift();
        return this.loadChildrenNodesDataInDatabase(entity).pipe(
            map(
                res => ({
                    next: entities,
                    done: entity
                })
            )
        );
    }

    loadChildrenNodesDataInDatabaseRec(entities: Array<DMEntity>): Observable<DynamicFlatNodeWithUid> {
        return this.loadChildrenNodesDataInDatabaseReturnTodo(entities).pipe(
            expand(({ next }) => next ? this.loadChildrenNodesDataInDatabaseReturnTodo(next) : EMPTY),
            concatMap(({ done }) => of(this.constructDynamicNodeFromDMEntity(done)))
        );
    }

    /*setInitialDataWithOpenFolder(uid: number, matTree: ElementRef): void {
        if (uid !== null) {
            this.retrieveNodes().pipe(
                toArray(),
                concatMap(
                    entities => combineLatest(entities, this.browseEntityService.findAllParents(uid))
                ),
                concatMap(
                    ([entities, parents]) => from(parents.reverse()).pipe(
                        concatMap(
                            parent => of(parent)
                        )
                    )
                ),
                concatMap(
                    parent => {
                        console.log('parent to be opened: ' + parent.uid);
                        const unsubscribe$ = new Subject();
                        return this.dataChange.pipe(
                            concatMap(
                                res => {
                                    let parentFound: Element;
                                    const matTreeNodes = matTree.nativeElement.getElementsByTagName('mat-tree-node');
                                    for (const matTreeNode of matTreeNodes) {
                                        if (matTreeNode.dataset.nodeuid !== null
                                            && matTreeNode.dataset.nodeuid !== undefined
                                            && Number(matTreeNode.dataset.nodeuid) === parent.uid) {
                                            parentFound = matTreeNode;
                                            console.log(parent.uid + ' parentFound: ' + parentFound);
                                        }
                                    }
                                    return of(parentFound);
                                }
                            ),
                            filter(res => res !== undefined),
                            concatMap(
                                parentFound => {
                                    if (parentFound !== undefined) {
                                        const buttons = parentFound.getElementsByTagName('button');
                                        if (buttons[0] === undefined) {
                                            console.log(parent.uid + ' click');
                                            buttons[0].click();
                                        }
                                        unsubscribe$.next();
                                        unsubscribe$.complete();
                                    }
                                    return of(parentFound);
                                }
                            )
                        );
                    }
                )
            ).subscribe(
                res => {
                    console.log('what is res ? ');
                    console.log(res);
                },
                error => console.log('error'),
                () => console.log('complete')
            );
        } else {
            this.setInitialData();
        }
    }*/

    /*setInitialDataWithOpenFolderOld(uid: number, matTree: ElementRef): void {
        if (uid !== null) {
            this.retrieveNodes().pipe(
                toArray(),
                concatMap(
                    entities => combineLatest(entities, this.browseEntityService.findAllParents(uid))
                ),
                concatMap(
                    ([entities, parents]) => from(parents.reverse()).pipe(
                        concatMap(
                            parent => of(parent)
                        )
                    )
                ),
                concatMap(
                    parent => {
                        console.log('parent to be opened: ' + parent.uid);
                        const unsubscribe$ = new Subject();
                        return this.dataChange.pipe(
                            concatMap(
                                res => {
                                    let parentFound: Element;
                                    const matTreeNodes = matTree.nativeElement.getElementsByTagName('mat-tree-node');
                                    for (const matTreeNode of matTreeNodes) {
                                        if (matTreeNode.dataset.nodeuid !== null
                                            && matTreeNode.dataset.nodeuid !== undefined
                                            && Number(matTreeNode.dataset.nodeuid) === parent.uid) {
                                            parentFound = matTreeNode;
                                            console.log(parent.uid + ' parentFound: ' + parentFound);
                                        }
                                    }
                                    return of(parentFound);
                                }
                            ),
                            filter(res => res !== undefined),
                            concatMap(
                                parentFound => {
                                    if (parentFound !== undefined) {
                                        const buttons = parentFound.getElementsByTagName('button');
                                        if (buttons[0] === undefined) {
                                            console.log(parent.uid + ' click');
                                            buttons[0].click();
                                        }
                                        unsubscribe$.next();
                                        unsubscribe$.complete();
                                    }
                                    return of(parentFound);
                                }
                            )
                        );
                    }
                )
            ).subscribe(
                res => {
                    console.log('what is res ? ');
                    console.log(res);
                },
                error => console.log('error'),
                () => console.log('complete')
            );
        } else {
            this.setInitialData();
        }
    }*/
}
