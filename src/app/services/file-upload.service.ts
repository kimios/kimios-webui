import {Injectable} from '@angular/core';

import {Document as KimiosDocument, DocumentService} from 'app/kimios-client-api';
import {BehaviorSubject, combineLatest, forkJoin, from, Observable, of} from 'rxjs';
import {SessionService} from './session.service';
import {HttpEventType} from '@angular/common/http';
import {catchError, concatMap, map, switchMap, tap} from 'rxjs/operators';
import {TagService} from './tag.service';
import {DocumentRefreshService} from './document-refresh.service';
import {DocumentDetailService} from './document-detail.service';
import {BrowseEntityService} from './browse-entity.service';
import {NotificationService} from './notification.service';
import {DocumentUploadStatus} from '../main/model/document-upload';
import {EntityCacheService} from './entity-cache.service';

interface TagJob {
    docId: number;
    docName: string;
    tagIds: number[];
}

const defaultUploadError = 'Error, this document has not been uploaded';

@Injectable({
    providedIn: 'root'
})

export class FileUploadService {

    public lastUploadedDocumentId: Observable<number>;

    uploadingFile: BehaviorSubject<string>;
    filesProgress: Map<string, BehaviorSubject<{ name: string, status: string, message: string }>>;
    filesUploaded: Map<string, BehaviorSubject<Array<string>>>;
    filesUploadedDocuments: Map<string, BehaviorSubject<KimiosDocument>>;
    uploadQueue$: BehaviorSubject<Array<string>>;
    uploadQueue: Map<string, Array<any>>;
    uploadingFiles$: BehaviorSubject<Array<any>>;
    uploadFinished$: BehaviorSubject<string>;
    private uploadingFiles: any[];
    allUploads: Map<string, Array<any>>;

    uploading$: BehaviorSubject<boolean>;

    constructor(
        private documentService: DocumentService,
        private sessionService: SessionService,
        private tagService: TagService,
        private documentRefreshService: DocumentRefreshService,
        private documentDetailService: DocumentDetailService,
        private browseEntityService: BrowseEntityService,
        private notificationService: NotificationService,
        private entityCacheService: EntityCacheService
    ) {
        this.filesProgress = new Map<string, BehaviorSubject<{ name: string, status: string, message: string }>>();
        this.filesUploaded = new Map<string, BehaviorSubject<string[]>>();
        this.filesUploadedDocuments = new Map<string, BehaviorSubject<KimiosDocument>>();
        this.uploadingFile = new BehaviorSubject<string>(undefined);
        this.lastUploadedDocumentId = undefined;

        this.uploadQueue = new Map<string, Array<any>>();
        this.uploadQueue$ = new BehaviorSubject(null);
        this.uploadingFiles$ = new BehaviorSubject<Array<any>>([]);
        this.uploadingFiles = new Array<any>();
        this.allUploads = new Map<string, Array<any>>();
        this.uploadFinished$ = new BehaviorSubject<string>(undefined);

        this.uploading$ = new BehaviorSubject<boolean>(false);

        this.init();
    }

    init(): void {
        this.uploadingFile.subscribe(
            next => {
                this.uploadingFiles.push(next);
                this.uploadingFiles$.next(this.uploadingFiles.slice());
            }
        );

        this.uploadFinished$.subscribe(
            next => {
                if (next !== undefined) {
                    from(next).pipe(
                        map(
                            uploadId => {
                                const index = this.uploadingFiles.indexOf(uploadId);
                                if (index > -1) {
                                    this.uploadingFiles.splice(index, 1);
                                }
                                return uploadId;
                            }
                        ),
                        concatMap(
                            uploadId => {
                                return combineLatest(
                                    of(uploadId),
                                    (this.filesProgress.get(uploadId) !== undefined &&
                                        this.filesProgress.get(uploadId).getValue().status === 'done') ?
                                        this.tagFile(Number(uploadId), this.allUploads.get(uploadId)[7]) :
                                        of([])
                                );
                            }
                        ),
                        concatMap(
                            ([uploadId, tags]) => {
                                if (tags.length > 0) {
                                    this.filesUploaded.get(uploadId).next(tags);
                                }
                                return uploadId;
                            }
                        )
                    );
                } else {
                    return of();
                }
            }
        );
    }

    private uploadFile(
        uploadId: string,
        document: File,
//        sessionId?: string,
        docPath?: string,
        isSecurityInherited?: boolean,
        securityItems?: string,
        isRecursive?: boolean,
        documentTypeId?: number,
        metaItems?: string,
        tags?: string[]
    ): Observable<{ name: string, status: string, message: number } | number | string > {

        if (uploadId === null
            || uploadId === undefined) {
            uploadId = this.generateUploadId();
        }
        this.uploadingFile.next(uploadId);
        this.filesUploaded.set(uploadId, new BehaviorSubject([]));
        this.filesUploadedDocuments.set(uploadId, new BehaviorSubject(undefined));

        return this.documentService.createDocumentFromFullPathWithPropertiesNoHash(
            document
            , this.sessionService.sessionToken
            , docPath
            , isSecurityInherited
            , securityItems
            , isRecursive
            , -1
            , metaItems
            , ''
            , ''
            , 'events'
            , true
        ).pipe(
            switchMap(
                response =>
                    of(response)
                        .map(event => {
                            let res;
                            let reportProgress = true;
                            if (event['ok'] != null
                                && event['ok'] !== undefined
                                && event['ok'] === false) {
                                console.log('error catched: ');
                                console.log(event);
                                res = { name: document.name, status: 'status', message: event['statusText'] ? event['statusText'] : '<no message>' };
                                reportProgress = false;
                            } else {

                                switch (event.type) {

                                    case HttpEventType.UploadProgress:
                                        const progress = Math.round(100 * event.loaded / event.total);
                                        res = {name: document.name, status: 'progress', message: progress};
                                        this.notificationService.updateUploadPercentage(docPath, progress);
                                        break;

                                    case HttpEventType.Response:
                                        res = {
                                            name: document.name,
                                            status: event.body ? 'done' : 'status',
                                            message: event.body ? event.body : event.status
                                        };
                                        this.lastUploadedDocumentId = res;
                                        this.notificationService.updateUploadStatus(docPath, DocumentUploadStatus.SUCCESSFUL, res.message);
                                        break;

                                    default:
                                        res = {
                                            name: document.name,
                                            status: 'event',
                                            message: 'Unhandled event: ' + event.type
                                        };
                                        reportProgress = false;
                                }
                            }
                            if (reportProgress) {
                                this.filesProgress.get(uploadId).next(res);
                            }
                            // this.notificationService.updateUploadStatus(docPath, DocumentUploadStatus.ERROR);
                            return res;
                        })
                        .catch(error => of(error))
            ),
            catchError(error => {
                const res = {
                    name: document.name,
                    status: 'error',
                    message:
                        error['error'] ?
                            error['error']['message'] ?
                            error['error']['message'] :
                                defaultUploadError :
                            defaultUploadError

                };
                this.filesProgress.get(uploadId).next(res);
                this.notificationService.updateUploadStatus(docPath, DocumentUploadStatus.ERROR);
                console.log('second catchError: ');
                console.log(res);
                return of(res);
            }),
            map(response => {
                let res = response;
                if (response instanceof Error) {
                    res = { name: document.name, status: 'error', message: response.message };
                }
                if (['done', 'error'].includes(res.status)) {
                    this.uploadFinished$.next(uploadId);
                }
                console.log('in the map (' + document.name + ')');
                return res;
            }),
            tap(
                (res) => {
                    if (res['status'] === 'done') {
                        const newDocId = res['message'];
                        this.entityCacheService.findDocumentInCache(newDocId)
                            .subscribe(
                                kimiosDocument => {
                                    this.filesUploadedDocuments.get(uploadId).next(kimiosDocument);
                                }
                            );
                        if (tags
                            && tags.length > 0) {
                            this.tagFile(newDocId, tags)
                                .subscribe(
                                    next => this.filesUploaded.get(uploadId).next(next)
                                );
                        }
                    }
                }
            )
        );
    }

    tagFile(docId: number, tags: string[]): Observable<Array<string>> {
        return forkJoin(
            from(tags).pipe(
                concatMap(
                    next => this.documentService.updateDocumentTag(
                        this.sessionService.sessionToken,
                        docId,
                        next,
                        true
                    )
                )
            )
        ).pipe(
            concatMap(
                () => this.entityCacheService.reloadEntity(docId)
            ),
            map(doc => (doc as KimiosDocument).tags)
        );
    }

    uploadFiles(array: Array<Array<any>>): Observable<{ name: string, status: string, message: number } | number | string > {
        array.forEach(
            elem => {
                const uploadId = this.generateUploadId();
                this.filesProgress.set(
                    uploadId,
                    new BehaviorSubject({ name: elem[0]['name'], status: 'not started', message: '-1' })
                );
                this.uploadQueue.set(uploadId, elem);
                this.allUploads.set(uploadId, elem);
                this.notificationService.createUpload(elem[1]);
                this.notificationService.updateUploadStatus(elem[1], DocumentUploadStatus.ONGOING);
            }
        );
        this.uploadQueue$.next(Array.from(this.uploadQueue.keys()));

        const queue = Array.from(this.uploadQueue.keys()).slice();

        return from(queue).pipe(
            concatMap(
                uploadId => {
                    this.uploadQueue.delete(uploadId);
                    this.uploadQueue$.next(Array.from(this.uploadQueue.keys()));
                    return of(uploadId);
                }
            ),
            concatMap(
                uploadId => {
                    const fileArray = this.allUploads.get(uploadId);
                    return this.uploadFile(
                        uploadId,
                        fileArray[0],
//        sessionId?: string,
                        fileArray[1],
                        fileArray[2],
                        fileArray[3],
                        fileArray[4],
                        fileArray[5],
                        fileArray[6],
                        fileArray[7]
                    );
                }
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
            switchMap(
                response =>
                    of(response)
                        .map(next => next)
                        .catch(error => of(error))
            ),
            map((event) => {
                let res;
                if (event.ok
                    && event.ok === false) {
                    console.log('error catched: ');
                    console.log(event);
                    res = { name: document.name, status: 'error', message: event.message };
                } else {

                    switch (event.type) {

                        case HttpEventType.UploadProgress:
                            const progress = Math.round(100 * event.loaded / event.total);
                            res = {name: document.name, status: 'progress', message: progress};
                            break;

                        case HttpEventType.Response:
                            res = event.body ? event.body : event.status;
                            break;

                        default:
                            res = `Unhandled event: ${event.type}`;
                    }
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

    private generateUploadId(): string {
        return 'upload-' + Math.random().toString(36).substr(2, 16);
    }

}
