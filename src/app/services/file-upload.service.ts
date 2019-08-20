import {Injectable} from '@angular/core';

import {DocumentService} from 'app/kimios-client-api';
import {BehaviorSubject, from, Observable} from 'rxjs';
import {SessionService} from './session.service';
import {HttpEventType} from '@angular/common/http';
import {concatMap, map, mergeAll, tap} from 'rxjs/operators';
import {TagService} from './tag.service';
import {DocumentRefreshService} from './document-refresh.service';
import {isNumeric} from 'rxjs/internal-compatibility';
import {Tag} from 'app/main/model/tag';
import {DocumentDetailService} from './document-detail.service';

@Injectable({
    providedIn: 'root'
})
export class FileUploadService {

    public lastUploadedDocumentId: Observable<number>;

    onFilesUploading: BehaviorSubject<any>;
    uploadingFile: BehaviorSubject<File>;
    filesProgress: Map<string, BehaviorSubject<{ name: string, status: string, message: number }>>;
    filesUploaded: Map<string, BehaviorSubject<Tag[]>>;

    constructor(
        private documentService: DocumentService,
        private sessionService: SessionService,
        private tagService: TagService,
        private documentRefreshService: DocumentRefreshService,
        private documentDetailService: DocumentDetailService
    ) {
        this.onFilesUploading = new BehaviorSubject([]);
        this.filesProgress = new Map<string, BehaviorSubject<{ name: string, status: string, message: number }>>();
        this.filesUploaded = new Map<string, BehaviorSubject<Tag[]>>();
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
        metaItems?: string,
        tags?: number[]
    ): Observable<{ name: string, status: string, message: number } | number | string > {
        this.uploadingFile.next(document);
        this.filesUploaded.set(document.name, new BehaviorSubject([]));

        return this.documentService.createDocumentFromFullPathWithPropertiesNoHash(
            document
            , this.sessionService.sessionToken
            , docPath
            , isSecurityInherited
            , securityItems
            , isRecursive
            , (documentTypeId === null || documentTypeId === undefined || documentTypeId === -1) ?
                this.tagService.documentType.uid :
                documentTypeId
            , metaItems
            , ''
            , ''
            , 'events'
            , true
        ).pipe(
            map((event) => {
                let res;
                switch (event.type) {

                    case HttpEventType.UploadProgress:
                        const progress = Math.round(100 * event.loaded / event.total);
                        res = { name: document.name, status: 'progress', message: progress };
                        break;

                    case HttpEventType.Response:
                        res = event.body ? event.body : event.status;
                        break;

                    default:
                        res = `Unhandled event: ${event.type}`;
                }
                this.filesProgress.get(document.name).next(res);
                return res;
            })
        ).pipe(
            tap(
                res => {
                    if (tags
                        && tags.length > 0
                        && isNumeric(res)) {
                        const docId = res;
                        from(tags)
                            .pipe(
                                map(
                                    tagId => this.documentService.updateDocumentTag(
                                        this.sessionService.sessionToken,
                                        Number(docId),
                                        tagId
                                    )
                                ),
                                mergeAll(),
                                concatMap(
                                    res2 => this.documentDetailService.retrieveDocumentTags(
                                        Number(docId)
                                    )
                                ),
                                tap(
                                    res3 => this.filesUploaded.get(document.name).next(res3)
                                )
                        );
                    }
                }
            )
        );
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

    uploadNewVersion(document: File, documentId: number): Observable<{ name: string, status: string, message: number } | number | string > {

        return this.documentService.uploadNewDocumentVersion(
            this.sessionService.sessionToken,
            documentId,
            document,
            'events',
            true
        ).pipe(
            map((event) => {
                let res;
                switch (event.type) {

                    case HttpEventType.UploadProgress:
                        const progress = Math.round(100 * event.loaded / event.total);
                        res = { name: document.name, status: 'progress', message: progress };
                        break;

                    case HttpEventType.Response:
                        res = event.body ? event.body : event.status;
                        break;

                    default:
                        res = `Unhandled event: ${event.type}`;
                }

                return res;
            }),
            tap({
                next: (val) => {},
                error: (error) => {},
                complete: () => this.documentRefreshService.needRefresh.next(documentId)
            })
        );
    }

}
