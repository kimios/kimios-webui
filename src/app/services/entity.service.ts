import {Injectable} from '@angular/core';
import {DMEntity, Document, DocumentService, Folder, FolderService, SearchService, Workspace, WorkspaceService} from 'app/kimios-client-api';
import {Observable, of, throwError} from 'rxjs';
import {SessionService} from './session.service';
import {catchError} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class EntityService {

    constructor(
        private sessionService: SessionService,
        private documentService: DocumentService,
        private workspaceService: WorkspaceService,
        private folderService: FolderService,
        private searchService: SearchService
    ) { }

    retrieveEntitiesAtPath(path: string): Observable<DMEntity[]> {
        let array: Observable<DMEntity[]>;
        let pathArray = path.split('/');
        return array;
    }


    retrieveEntity(path: string): Observable<DMEntity> {

        let entity: Observable<DMEntity>;
        entity = this.searchService.getDMentityFromPath(this.sessionService.sessionToken, path);
        console.log('entity ', entity.path);
        return entity;


    }

    retrieveUserWorkspaces(): Observable<Workspace[]> {
        return this.workspaceService.getWorkspaces(this.sessionService.sessionToken);
    }

    retrieveFolder(folderName: string, parent: DMEntity): Observable<any> {
        return this.folderService.getFolders(this.sessionService.sessionToken, parent.uid)
            .pipe(
                catchError((err) => of())
            )
            .map(
                (array: Array<any>) => of(
                    array.filter(
                        (elem) => elem.name === folderName
                    ).shift()
                )
            );
    }

    retrieveFolderFiles(parent: DMEntity): Observable<Document[]> {
        return this.documentService.getDocuments(this.sessionService.sessionToken, parent.uid);

    }
}
