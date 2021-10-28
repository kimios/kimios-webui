import { Injectable } from '@angular/core';
import {DocumentCacheData, EntityCacheData} from 'app/main/model/entity-cache-data';
import {DocumentVersion, DocumentVersionService, Document as KimiosDocument, DocumentService} from 'app/kimios-client-api';
import {SessionService} from './session.service';
import {tap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EntityCacheService {

  private entitiesCache: Map<number, EntityCacheData>;

  constructor(
      private sessionService: SessionService,
      private documentVersionService: DocumentVersionService,
      private documentService: DocumentService
  ) {
    this.entitiesCache = new Map<number, EntityCacheData>();
  }

  getEntityInCache(uid: number): EntityCacheData {
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
}
