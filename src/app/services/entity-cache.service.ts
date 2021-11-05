import {Injectable} from '@angular/core';
import {DocumentCacheData, EntityCacheData} from 'app/main/model/entity-cache-data';
import {
  DMEntity,
  Document as KimiosDocument,
  DocumentService,
  DocumentVersion,
  DocumentVersionService,
  Folder,
  FolderService,
  Workspace,
  WorkspaceService
} from 'app/kimios-client-api';
import {SessionService} from './session.service';
import {catchError, concatMap, map, switchMap, tap} from 'rxjs/operators';
import {combineLatest, from, Observable, of} from 'rxjs';
import {SearchEntityService} from './searchentity.service';
import {BrowseEntityService} from './browse-entity.service';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';

@Injectable({
  providedIn: 'root'
})
export class EntityCacheService {

  private entitiesCache: Map<number, EntityCacheData>;
  private entitiesHierarchyCache: Map<number, Array<number>>;
  private allTags: Map<string, number>;

  constructor(
      private sessionService: SessionService,
      private documentVersionService: DocumentVersionService,
      private documentService: DocumentService,
      private searchEntityService: SearchEntityService,
      private workspaceService: WorkspaceService,
      private folderService: FolderService
  ) {
    this.entitiesCache = new Map<number, EntityCacheData>();
    this.allTags = null;
    this.entitiesHierarchyCache = new Map<number, Array<number>>();
  }

  getEntityCacheData(uid: number): EntityCacheData {
    return this.entitiesCache.get(uid);
  }

  getDocumentCacheData(uid: number): DocumentCacheData {
    const documentCacheDate = this.entitiesCache.get(uid);
    return (documentCacheDate instanceof DocumentCacheData) ?
        documentCacheDate :
        null;
  }

  findDocumentVersions(uid: number): Array<DocumentVersion> {
    const documentCacheData = this.getDocumentCacheData(uid);
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
    const documentCacheData = this.getDocumentCacheData(uid);
    documentCacheData.versions = versions;
    this.entitiesCache.set(uid, documentCacheData);
  }

  findDocumentInCache(uid: number): Observable<KimiosDocument> {
    const documentInCache = this.getDocumentCacheData(uid);

    return documentInCache == null ?
        this.documentService.getDocument(this.sessionService.sessionToken, uid).pipe(
            tap(document => this.entitiesCache.set(uid, new EntityCacheData(document)))
        ) :
        of(documentInCache.entity);
  }

  findDocumentVersionsInCache(uid: number): Observable<Array<DocumentVersion>> {
    return (this.getDocumentCacheData(uid) == null ?
      this.initDocumentDataInCache(uid) :
      of(this.getDocumentCacheData(uid))
    ).pipe(
      tap(documentCacheData => console.dir(documentCacheData)),
      concatMap(documentCacheData => documentCacheData == null ?
        of(null) :
        this.getDocumentCacheDataWithVersions(documentCacheData)
      ),
      tap(() => console.log('after getDocumentCacheDataWithVersions()')),
      tap(documentCacheData => console.dir(documentCacheData)),
      map(documentCacheData => documentCacheData instanceof DocumentCacheData ? documentCacheData.versions : null)
    );
  }

  private initDocumentDataInCache(uid: number): Observable<DocumentCacheData> {
    return this.documentService.getDocument(this.sessionService.sessionToken, uid).pipe(
      concatMap(doc => doc == null ? of(null) : of(new DocumentCacheData(doc)))
    );
  }

  private updateDocumentCacheDataVersions(documentCacheData: DocumentCacheData): Observable<DocumentCacheData> {
    return this.documentVersionService.getDocumentVersions(this.sessionService.sessionToken, documentCacheData.entity.uid).pipe(
      map(documentVersions => {
        documentCacheData.versions = documentVersions;
        this.entitiesCache.set(documentCacheData.entity.uid, documentCacheData);
        return this.getDocumentCacheData(documentCacheData.entity.uid);
      })
    );
  }

  private getDocumentCacheDataWithVersions(documentCacheData: DocumentCacheData): Observable<DocumentCacheData> {
    return documentCacheData.versions == null ?
      this.updateDocumentCacheDataVersions(documentCacheData) :
      of(documentCacheData);
  }

  findAllTags(): Observable<Map<string, number>> {
    return this.allTags == null ?
      this.initAllTags() :
      of(this.allTags);
  }

  private initAllTags(): Observable<Map<string, number>> {
    return this.searchEntityService.retrieveAllTags().pipe(
      tap(allTags => this.allTags = allTags)
    );
  }

  public findEntityChildrenInCache(uidParam: number, onlyContainers: boolean): Observable<Array<DMEntity>> {
    const idInHierarchy = uidParam == null ? 0 : uidParam;
    return from(of(uidParam)).pipe(
      concatMap(uid =>
        (this.entitiesHierarchyCache.get(idInHierarchy) == null
          || this.entitiesHierarchyCache.get(idInHierarchy) === undefined) ?
          this.initHierarchyCacheForEntity(uid) :
          of(this.entitiesHierarchyCache.get(idInHierarchy).map(entityUid => this.entitiesCache.get(entityUid).entity))
      ),
      concatMap(entityList => onlyContainers === true ?
        of(entityList.filter(entity => DMEntityUtils.dmEntityIsFolder(entity) || DMEntityUtils.dmEntityIsWorkspace(entity))) :
        of(entityList)
      )
    );
  }

  public reloadEntityChildren(uid: number): Observable<Array<DMEntity>> {
    return this.initHierarchyCacheForEntity(uid);
  }

  private initHierarchyCacheForEntity(uid: number): Observable<Array<DMEntity>> {
    return this.findEntitiesAtPathFromId(uid).pipe(
      tap(entityList => entityList.forEach(entity => this.entitiesCache.set(entity.uid, new EntityCacheData(entity)))),
      tap(entityList => this.entitiesHierarchyCache.set(uid == null ? 0 : uid, entityList.map(entity => entity.uid)))
    );
  }

  public findEntityInCache(entityUid: number): Observable<DMEntity> {
    return this.entitiesCache.get(entityUid) != null ?
      of(this.entitiesCache.get(entityUid).entity) :
      this.initEntityInCache(entityUid);
  }

  private initEntityInCache(entityUid: number): Observable<DMEntity> {
    return this.retrieveEntity(entityUid).pipe(
      tap(entity => {
        if (entity != null && entity !== undefined && entity !== '') {
          this.entitiesCache.set(
            entity.uid,
            DMEntityUtils.dmEntityIsDocument(entity) ?
              new DocumentCacheData(entity) :
              new EntityCacheData(entity)
          );
        }
      })
    );
  }

  public findContainerEntityInCache(entityUid): Observable<DMEntity> {
    return this.entitiesCache.get(entityUid) != null ?
      of(this.entitiesCache.get(entityUid).entity) :
      this.initContainerEntityInCache(entityUid);
  }

  private retrieveEntity(uid: number): Observable<DMEntity> {
    return this.retrieveContainerEntity(uid).pipe(
      concatMap(res => res == null || res === undefined || res === '' ?
        this.documentService.getDocument(this.sessionService.sessionToken, uid) :
        of(res)
      ));
  }

  private retrieveContainerEntity(uid: number): Observable<DMEntity> {
    return this.retrieveFolderEntity(uid).pipe(
        concatMap(
          res => (res === null || res === undefined || res === '') ?
            this.retrieveWorkspaceEntity(uid) :
            of(res)
        )
      );
  }

  private retrieveWorkspaceEntity(uid: number): Observable<Workspace> {
    return this.workspaceService.getWorkspace(this.sessionService.sessionToken, uid).pipe(
      switchMap(
        res => of(res).catch(error => of(error))
      ),
      catchError(error => {
        console.log(error);
        return of('');
      }),
      map(res => res)
    );
  }

  private retrieveFolderEntity(uid: number): Observable<Folder> {
    return this.folderService.getFolder(this.sessionService.sessionToken, uid).pipe(
      switchMap(
        res => of(res).catch(error => of(error))
      ),
      catchError(error => {
        console.log(error);
        return of('');
      }),
      map(res => res)
    );
  }

  private initContainerEntityInCache(entityUid: number): Observable<DMEntity> {
    return this.retrieveContainerEntity(entityUid).pipe(
      tap(entity => {
        if (entity != null && entity !== undefined && entity !== '') {
          this.entitiesCache.set(entity.uid, new EntityCacheData(entity));
        }
      })
    );
  }

  public findWorkspaceInCache(uid: number): Observable<Workspace> {
    return (this.getWorkspaceInCache(uid) == null ?
      this.initContainerEntityInCache(uid) :
      of(this.getWorkspaceInCache(uid))
    ).pipe(
      concatMap(entity => entity != null && DMEntityUtils.dmEntityIsWorkspace(entity) ?
        of(entity) :
        of(null)
      )
    );
  }

  private getWorkspaceInCache(uid: number): Workspace {
    const entityCacheData = this.entitiesCache.get(uid);
    if (entityCacheData && DMEntityUtils.dmEntityIsWorkspace(entityCacheData.entity)) {
      return entityCacheData.entity as Workspace;
    } else {
      return null;
    }
  }

  public getEntity(uid: number): DMEntity {
    const entityCacheData = this.entitiesCache.get(uid);
    return entityCacheData != null ?
      entityCacheData.entity :
      null;
  }

  reloadEntity(uid: number): Observable<DMEntity> {
    const entity = this.getEntity(uid);
    if (entity != null) {
      return this.updateEntityInCache(entity);
    } else {
      return this.initEntityInCache(uid);
    }
  }

  private updateEntityInCache(entity: DMEntity): Observable<DMEntity> {
    if (DMEntityUtils.dmEntityIsDocument(entity)) {
      return this.documentService.getDocument(this.sessionService.sessionToken, entity.uid).pipe(
        tap(res => {
          if (res != null && res !== undefined && res !== '') {
            this.entitiesCache.set(res.uid, new EntityCacheData(res));
          }
        })
      );
    } else {
      if (DMEntityUtils.dmEntityIsFolder(entity)) {
        return this.folderService.getFolder(this.sessionService.sessionToken, entity.uid).pipe(
          tap(res => {
            if (res != null && res !== undefined && res !== '') {
              this.entitiesCache.set(res.uid, new EntityCacheData(res));
            }
          })
        );
      } else {
        return this.workspaceService.getWorkspace(this.sessionService.sessionToken, entity.uid).pipe(
          tap(res => {
            if (res != null && res !== undefined && res !== '') {
              this.entitiesCache.set(res.uid, new EntityCacheData(res));
            }
          })
        );
      }
    }
  }

  findEntitiesAtPathFromId(parentUid?: number): Observable<DMEntity[]> {
    if (parentUid === null
      || parentUid === undefined) {
      return this.workspaceService.getWorkspaces(this.sessionService.sessionToken);
    } else {
      return this.retrieveContainerEntity(parentUid).pipe(
        concatMap(
          res => combineLatest(of(res), this.folderService.getFolders(this.sessionService.sessionToken, parentUid))
        ),
        concatMap(
          ([parentEntity, folders]) => combineLatest(
            of(folders),
            DMEntityUtils.dmEntityIsWorkspace(parentEntity) ?
              of([]) :
              this.documentService.getDocuments(this.sessionService.sessionToken, parentUid)
          )
        ),
        concatMap(
          ([folders, documents]) => of(folders.concat(documents))
        )
      );
    }
  }
}
