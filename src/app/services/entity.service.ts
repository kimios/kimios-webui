import {Injectable} from '@angular/core';
import {DMEntity, Document, DocumentService, Folder, FolderService, Workspace, WorkspaceService} from 'app/kimios-client-api';
import {Observable, of, throwError} from 'rxjs';
import {SessionService} from './session.service';
import {camelCaseToDashCase} from '@angular/platform-browser/src/dom/util';
import {catchError} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class EntityService {

    constructor(
        private sessionService: SessionService,
        private documentService: DocumentService,
        private workspaceService: WorkspaceService,
        private folderService: FolderService
    ) { }

    retrieveEntitiesAtPath(path: string): Observable<DMEntity[]> {
        let array: Observable<DMEntity[]>;

        let pathArray = path.split('/');


        return array;
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

}
