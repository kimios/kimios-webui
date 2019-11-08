import {DMEntity} from 'app/kimios-client-api';
import {SearchEntityService} from 'app/services/searchentity.service';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {DataSource} from '@angular/cdk/table';
import {CollectionViewer} from '@angular/cdk/collections';
import {Observable} from 'rxjs';

export class EntityDataSource extends DataSource<DMEntity> {

    documents: Map<number, DMEntity>;
    folders: Map<number, Array<DMEntity>>;
    sorts: Map<string, Array<number>>;
    foldersLoaded: Array<number>;

    constructor(
        private _fileManagerService: SearchEntityService,
        private _browseEntityService: BrowseEntityService
    ) {
        super();

    }

    loadEntities(sortField: string, sortDir: string, page: number, parentEntityUid: number): Observable<DMEntity[]> {
        return this._fileManagerService.getDocumentsInDir(sortField, sortDir, page, parentEntityUid);
    }

    private retrieveFolders(parentUid: number): void {
        /*this._browseEntityService.findContainerEntitiesAtPath(parentUid).subscribe(
            res => this.folders.set(parentUid, res),
            error => error,
            () => this.foldersLoaded.push(parentUid)
        );*/
    }

    connect(collectionViewer: CollectionViewer): Observable<DMEntity[] | ReadonlyArray<DMEntity>> {
        /*return this.loadEntities(sortField, sortDir, page);*/
        return null;
    }

    disconnect(collectionViewer: CollectionViewer): void {
    }

    sortFolders(sortField: string, sortDirection: string, page: number): void {
        /*if (this.foldersLoaded()) {
            this.sorts.set(sortField, this.folders.get())
        }*/
    }
}
