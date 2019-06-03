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
    uploadingFile: BehaviorSubject<File>;
    filesProgress: Map<string, BehaviorSubject<{ name: string, status: string, message: number }>>;

    constructor(
        private documentService: DocumentService,
        private sessionService: SessionService
    ) {
        this.onFilesUploading = new BehaviorSubject([]);
        this.filesProgress = new Map<string, BehaviorSubject<{ name: string, status: string, message: number }>>();
        this.uploadingFile = new BehaviorSubject<File>(undefined);
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
        this.uploadingFile.next(document);

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
            let res;
            switch (event.type) {

                case HttpEventType.UploadProgress:
                    const progress = Math.round(100 * event.loaded / event.total);
                    res = { name: document.name, status: 'progress', message: progress };
                    break;

                case HttpEventType.Response:
                    res = event.body;
                    break;

                default:
                    res = `Unhandled event: ${event.type}`;
            }
            this.filesProgress.get(document.name).next(res);
            return res;
        }));
    }

    uploadFiles(array: Array<Array<any>>): Observable<{ name: string, status: string, message: number } | number | string > {
        array.forEach(
            elem => this.filesProgress.set(
                elem[0]['name'],
                new BehaviorSubject({ name: elem[0]['name'], status: 'not started', message: -1 })
            )
        );

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
