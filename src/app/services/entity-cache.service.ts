import { Injectable } from '@angular/core';
import {DocumentCacheData, EntityCacheData} from 'app/main/model/entity-cache-data';
import {DocumentVersion, DocumentVersionService, Document as KimiosDocument, DocumentService} from 'app/kimios-client-api';
import {SessionService} from './session.service';
import {concatMap, map, tap} from 'rxjs/operators';
import {iif, Observable, of} from 'rxjs';
import {SearchEntityService} from './searchentity.service';

@Injectable({
  providedIn: 'root'
})
export class EntityCacheService {

  private entitiesCache: Map<number, EntityCacheData>;
  private allTags: Map<string, number>;

  constructor(
      private sessionService: SessionService,
      private documentVersionService: DocumentVersionService,
      private documentService: DocumentService,
      private searchEntityService: SearchEntityService
  ) {
    this.entitiesCache = new Map<number, EntityCacheData>();
    this.allTags = null;
  }

  getEntityCacheData(uid: number): EntityCacheData {
    return this.entitiesCache.get(uid);
  }

  getDocumentInCache(uid: number): DocumentCacheData {
    const documentCacheDate = this.entitiesCache.get(uid);
    return (documentCacheDate instanceof DocumentCacheData) ?
        documentCacheDate :
        null;
  }

  findDocumentVersions(uid: number): Array<DocumentVersion> {
    const documentCacheData = this.getDocumentInCache(uid);
    if (documentCacheData == null) {
      return null;
    }
    if (documentCacheData.versions == null) {
      this.documentVersionService.getDocumentVersions(this.sessionService.sessionToken, uid).pipe(
          tap(documentVersions => this.updateDocumentVersions(uid, documentVersions))
      ).subscribe();
    }
  }

  private updateDocumentVersions(uid: number, versions: Array<DocumentVersion>): void {
    const documentCacheData = this.getDocumentInCache(uid);
    documentCacheData.versions = versions;
    this.entitiesCache.set(uid, documentCacheData);
  }

  findDocumentInCache(uid: number): Observable<KimiosDocument> {
    const documentInCache = this.getDocumentInCache(uid);

    return documentInCache == null ?
        this.documentService.getDocument(this.sessionService.sessionToken, uid).pipe(
            tap(document => this.entitiesCache.set(uid, new EntityCacheData(document)))
        ) :
        of(documentInCache.entity);
  }

  findDocumentVersionsInCache(uid: number): Observable<Array<DocumentVersion>> {
    return iif(() => this.getDocumentInCache(uid) == null,
      this.initDocumentDataInCache(uid),
      of(this.getDocumentInCache(uid))
    ).pipe(
      tap(documentCacheData => console.dir(documentCacheData)),
      concatMap(documentCacheData => iif(
        () => documentCacheData == null,
        of(null),
        this.getDocumentCacheDataWithVersions(documentCacheData)
      )),
      tap(() => console.log('after getDocumentCacheDataWithVersions()')),
      tap(documentCacheData => console.dir(documentCacheData)),
      map(documentCacheData => documentCacheData instanceof DocumentCacheData ? documentCacheData.versions : null)
    );
  }

  private initDocumentDataInCache(uid: number): Observable<DocumentCacheData> {
    return this.documentService.getDocument(this.sessionService.sessionToken, uid).pipe(
      concatMap(doc => iif(() => doc == null, of(null), of(new DocumentCacheData(doc))))
    );
  }

  private updateDocumentCacheDataVersions(documentCacheData: DocumentCacheData): Observable<DocumentCacheData> {
    return this.documentVersionService.getDocumentVersions(this.sessionService.sessionToken, documentCacheData.entity.uid).pipe(
      map(documentVersions => {
        documentCacheData.versions = documentVersions;
        this.entitiesCache.set(documentCacheData.entity.uid, documentCacheData);
        return this.getDocumentInCache(documentCacheData.entity.uid);
      })
    );
  }

  private getDocumentCacheDataWithVersions(documentCacheData: DocumentCacheData): Observable<DocumentCacheData> {
    return iif(
      () => documentCacheData.versions == null,
      this.updateDocumentCacheDataVersions(documentCacheData),
      of(documentCacheData)
    );
  }

  findAllTags(): Observable<Map<string, number>> {
    return iif(
      () => this.allTags == null,
      this.initAllTags(),
      of(this.allTags)
    );
  }

  private initAllTags(): Observable<Map<string, number>> {
    return this.searchEntityService.retrieveAllTags().pipe(
      tap(allTags => this.allTags = allTags)
    );
  }
}
