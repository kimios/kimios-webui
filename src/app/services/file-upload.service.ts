import {Injectable} from '@angular/core';

import {DocumentService, InputStream} from '../kimios-client-api';
import {BehaviorSubject, Observable} from 'rxjs';
import {SessionService} from './session.service';
import {HttpEventType} from '@angular/common/http';
import {map} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class FileUploadService {

    public lastUploadedDocumentId: Observable<number>;

    onFilesUploading: BehaviorSubject<any>;

    constructor(
        private documentService: DocumentService,
        private sessionService: SessionService
    ) {
        this.onFilesUploading = new BehaviorSubject({});
    }

    uploadFile(
        document: InputStream,
//        sessionId?: string,
        docPath?: string,
        isSecurityInherited?: boolean,
        securityItems?: string,
        isRecursive?: boolean,
        documentTypeId?: number,
        metaItems?: string
    ): Observable<{ status: string, message: number } | number | string > {
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
                    return { status: 'progress', message: progress };

                case HttpEventType.Response:
                    return event.body;
                default:
                    return `Unhandled event: ${event.type}`;
            }
        }));
    }


}
