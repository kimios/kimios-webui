import {Injectable} from '@angular/core';

import {DocumentService} from '../kimios-client-api';
import {BehaviorSubject, from, Observable, of, throwError} from 'rxjs';
import {SessionService} from './session.service';
import {HttpEventType} from '@angular/common/http';
import {catchError, concatMap, map} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class FileUploadService {

    public lastUploadedDocumentId: Observable<number>;

    onFilesUploading: BehaviorSubject<any>;
    uploadingFile: BehaviorSubject<any>;
    filesProgress: Map<string, Observable<{ name: string, status: string, message: number }>>;

    constructor(
        private documentService: DocumentService,
        private sessionService: SessionService
    ) {
        this.onFilesUploading = new BehaviorSubject([]);
    }

    uploadFile(
        document: File,
//        sessionId?: string,
        docPath?: string,
        isSecurityInherited?: boolean,
        securityItems?: string,
        isRecursive?: boolean,
        documentTypeId?: number,
        metaItems?: string
    ): Observable<{ name: string, status: string, message: number } | number | string > {
        return this.documentService.createDocumentFromFullPathWithPropertiesNoHash(
            document
            , this.sessionService.sessionToken
            , docPath
            , isSecurityInherited
            , securityItems
            , isRecursive
            , documentTypeId
            , metaItems
            , ''
            , ''
            , 'events'
            , true
        ).pipe(map((event) => {

            switch (event.type) {

                case HttpEventType.UploadProgress:
                    const progress = Math.round(100 * event.loaded / event.total);
                    return { name: document.name, status: 'progress', message: progress };

                case HttpEventType.Response:
                    return event.body;
                default:
                    return `Unhandled event: ${event.type}`;
            }
        }));
    }

    uploadFiles(array: Array<Array<any>>): Observable<{ name: string, status: string, message: number } | number | string > {
        return from(array).pipe(
            concatMap(
                fileArray => this.uploadFile(
                    fileArray[0],
//        sessionId?: string,
                    fileArray[1],
                    fileArray[2],
                    fileArray[3],
                    fileArray[4],
                    fileArray[5],
                    fileArray[6]
                )
            )
        );
    }

}
