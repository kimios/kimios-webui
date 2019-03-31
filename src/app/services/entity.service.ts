import {Injectable} from '@angular/core';
import {DMEntity, Document, DocumentService, Folder, FolderService, SearchService, Workspace, WorkspaceService} from 'app/kimios-client-api';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {SessionService} from './session.service';
import {catchError} from 'rxjs/operators';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class EntityService implements Resolve<any> {


    onFilesChanged: BehaviorSubject<any>;
    onFileSelected: BehaviorSubject<any>;

    static compare(a: number | string, b: number | string, isAsc: boolean): number {

        if (typeof a === 'string'  && typeof b === 'string'){
            return (a.toLowerCase() < b.toLowerCase() ? -1 : 1) * (isAsc ? 1 : -1);
        } else {
            return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
        }
    }

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        // Set the defaults

        private sessionService: SessionService,
        private documentService: DocumentService,
        private workspaceService: WorkspaceService,
        private folderService: FolderService,
        private searchService: SearchService
    ) {
        this.onFilesChanged = new BehaviorSubject({});
        this.onFileSelected = new BehaviorSubject({});
    }

    retrieveEntitiesAtPath(path: string): Observable<DMEntity[]> {
        let array: Observable<DMEntity[]>;
        let pathArray = path.split('/');
        return array;
    }


    retrieveEntity(path: string): Observable<DMEntity> {
        let entity: Observable<DMEntity>;
        entity = this.searchService.getDMentityFromPath(this.sessionService.sessionToken, path);
        console.log('entity ', entity);
        return entity;


    }

    retrieveUserWorkspaces(): Observable<Workspace[]> {
        return this.workspaceService.getWorkspaces(this.sessionService.sessionToken);
    }

    retrieveFolders(parent: DMEntity): Observable<Folder[]> {
        return this.folderService.getFolders(this.sessionService.sessionToken, parent.uid);
    }

    retrieveFolderFiles(parent: DMEntity): Observable<Document[]> {
        return this.documentService.getDocuments(this.sessionService.sessionToken, parent.uid);

    }

    /**
     * Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.getFiles(null, null)
            ]).then(
                ([files]) => {
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Get files
     *
     * @returns {Promise<any>}
     */
    getFiles(sortField: string, sortDirection: string): Promise<any>
    {
        return new Promise((resolve, reject) => {
            console.log('inside Promise getFiles entity Service...')
            if (!this.sessionService.sessionAlive){
                console.log('session not alive');
                resolve([]);
            } else {
                this.searchService.getDMentityFromPath(this.sessionService.sessionToken, '/boumboumboum/mika')
                        .subscribe((response: any) => {
                            console.log('loaded folder', response);
                            this.documentService.getDocuments(this.sessionService.sessionToken, response.uid)
                                .subscribe((response2: any) => {

                                    // apply sorting
                                    if (sortField != null && sortField.trim().length > 0){
                                        if (sortField == null) { sortField = 'asc'; }
                                    } else {
                                        sortField = 'name';
                                        sortDirection = 'asc';
                                    }
                                    const entityList = response2.sort((a, b) => {
                                        const isAsc = sortDirection === 'asc';
                                        return EntityService.compare(a[sortField], b[sortField], isAsc);
                                    });
                                    this.onFilesChanged.next(entityList);
                                    this.onFileSelected.next(entityList[0]);
                                    resolve(response2);
                                }, reject);

                    }, reject);
            }
        });
    }

}
