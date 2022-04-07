import {Injectable} from '@angular/core';
import {DocumentCacheData, DocumentVersionWithMetaValues, EntityCacheData} from 'app/main/model/entity-cache-data';
import {
  Bookmark,
  DMEntity,
  Document as KimiosDocument,
  DocumentService,
  DocumentVersionService,
  Folder,
  FolderService,
  MetaValue, SecurityService,
  Workspace,
  WorkspaceService
} from 'app/kimios-client-api';
import {SessionService} from './session.service';
import {catchError, concatMap, expand, filter, map, switchMap, tap, toArray} from 'rxjs/operators';
import {BehaviorSubject, combineLatest, from, Observable, of, Subject} from 'rxjs';
import {SearchEntityService} from './searchentity.service';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {FolderUidListParam} from 'app/kimios-client-api/model/folderUidListParam';
import {CacheService} from './cache.service';
import {DataMessageImpl} from 'app/main/model/data-message-impl';
import {CacheSubjectsService} from './cache-subjects.service';
import {DMEntityWrapper} from '../kimios-client-api/model/dMEntityWrapper';
import {EntityPermissions} from '../main/model/entity-permissions';

@Injectable({
  providedIn: 'root'
})
export class EntityCacheService {

  private entitiesCache: Map<number, EntityCacheData>;
  private entitiesHierarchyCache: Map<number, Array<number>>;
  private allTags: Map<string, number>;
  private bookmarks: Array<Bookmark>;
  public reloadedEntity$: BehaviorSubject<DMEntity>;
  public newEntity$: BehaviorSubject<DMEntityWrapper>;
  public folderWithChildren$: Subject<DMEntity>;
  public chosenParentUid$: Subject<number>;
  private _intervalId: number;
  private _checkingDataMessagesQueue = false;
  public workspaceCreated$: Subject<number>;
  public workspaceUpdated$: Subject<number>;
  public workspaceRemoved$: Subject<number>;
  public folderCreated$: Subject<number>;
  public folderUpdated$: Subject<number>;
  public folderRemoved$: Subject<number>;
  public documentUpdate$: Subject<number>;
  public documentVersionCreated$: Subject<number>;
  public documentVersionUpdated$: Subject<DocumentVersionWithMetaValues>;
  
  constructor(
      private sessionService: SessionService,
      private documentVersionService: DocumentVersionService,
      private documentService: DocumentService,
      private searchEntityService: SearchEntityService,
      private workspaceService: WorkspaceService,
      private folderService: FolderService,
      private cacheService: CacheService,
      private cacheSubjectsService: CacheSubjectsService,
      private securityService: SecurityService
  ) {
    this.entitiesCache = new Map<number, EntityCacheData>();
    this.allTags = null;
    this.entitiesHierarchyCache = new Map<number, Array<number>>();
    this.reloadedEntity$ = new BehaviorSubject<DMEntity>(null);
    this.newEntity$ = new BehaviorSubject<DMEntityWrapper>(null);
    this.chosenParentUid$ = new Subject<number>();
    this.folderWithChildren$ = new Subject<DMEntity>();

    this._intervalId = window.setInterval(
      () => { if (this._checkingDataMessagesQueue === false) {
        this.checkDataMessagesQueue();
      }},
      1000
    );

    this.workspaceCreated$ = new Subject<number> ();
    this.workspaceUpdated$ = new Subject<number> ();
    this.workspaceRemoved$ = new Subject<number> ();
    this.folderCreated$ = new Subject<number> ();
    this.folderUpdated$ = new Subject<number> ();
    this.folderRemoved$ = new Subject<number> ();
    this.documentUpdate$ = new Subject<number>();
    this.documentVersionCreated$ = new Subject<number>();
    this.documentVersionUpdated$ = new Subject<DocumentVersionWithMetaValues>();

    this.cacheSubjectsService.workspaceCreated$.pipe(
      tap(params => this.handleWorkspaceCreated(params.dmEntityId))
    ).subscribe();
    this.cacheSubjectsService.workspaceUpdated$.pipe(
      tap(params => this.handleWorkspaceUpdated(params.dmEntityId))
    ).subscribe();
    this.cacheSubjectsService.workspaceRemoved$.pipe(
      tap(params => this.handleWorkspaceRemoved(params.dmEntityId))
    ).subscribe();

    this.cacheSubjectsService.folderCreated$.pipe(
      tap(params => this.handleFolderCreated(params.dmEntityId))
    ).subscribe();
    this.cacheSubjectsService.folderUpdated$.pipe(
      tap(params => this.handleFolderUpdated(params.dmEntityId))
    ).subscribe();
    this.cacheSubjectsService.folderRemoved$.pipe(
      tap(params => this.handleFolderRemoved(params.dmEntityId))
    ).subscribe();
    
    this.cacheSubjectsService.documentUpdate$.pipe(
      tap(params => this.handleDocumentUpdate(params.dmEntityId))
    ).subscribe();
    this.cacheSubjectsService.documentVersionCreated$.pipe(
      tap(params => this.handleDocumentVersionCreated(params.dmEntityId))
    ).subscribe();
    this.cacheSubjectsService.documentVersionUpdated$.pipe(
      tap(params => this.handleDocumentVersionUpdate(params.dmEntityId))
    ).subscribe();
    this.cacheSubjectsService.documentCheckout$.pipe(
      tap(params => this.handleDocumentCheckout(params.dmEntityId))
    ).subscribe();
    this.cacheSubjectsService.documentCheckin$.pipe(
      tap(params => this.handleDocumentCheckin(params.dmEntityId))
    ).subscribe();
    this.cacheSubjectsService.documentRemoved$.pipe(
      tap(params => this.handleDocumentRemoved(params.dmEntityId))
    ).subscribe();
    this.cacheSubjectsService.documentAddRelated$.pipe(
      tap(params => this.handleDocumentAddRelated(params.dmEntityId))
    ).subscribe();
    this.cacheSubjectsService.documentRemoveRelated$.pipe(
      tap(params => this.handleDocumentRemoveRelated(params.dmEntityId))
    ).subscribe();
    this.cacheSubjectsService.documentVersionCreate$.pipe(
      tap(params => this.handleDocumentVersionCreated(params.dmEntityId))
    ).subscribe();
    this.cacheSubjectsService.documentVersionCreateFromLatest$.pipe(
      tap(params => this.handleDocumentVersionCreateFromLatest(params.dmEntityId))
    ).subscribe();
    this.cacheSubjectsService.documentVersionUpdate$.pipe(
      tap(params => this.handleDocumentVersionUpdate(params.dmEntityId))
    ).subscribe();
    this.cacheSubjectsService.documentVersionRead$.pipe(
      tap(params => this.handleDocumentVersionRead(params.dmEntityId))
    ).subscribe();
    this.cacheSubjectsService.metaValueUpdate$.pipe(
      tap(params => this.handleMetaValueUpdate$(params.dmEntityId))
    ).subscribe();
    this.cacheSubjectsService.documentVersionCommentCreate$.pipe(
      tap(params => this.handleDocumentVersionCommentCreate(params.dmEntityId))
    ).subscribe();
    this.cacheSubjectsService.documentVersionCommentUpdate$.pipe(
      tap(params => this.handleDocumentVersionCommentUpdate(params.dmEntityId))
    ).subscribe();
    this.cacheSubjectsService.documentVersionCommentDelete$.pipe(
      tap(params => this.handleDocumentVersionCommentDelete(params.dmEntityId))
    ).subscribe();
    this.cacheSubjectsService.documentTrash$.pipe(
      tap(params => this.handleDocumentTrash(params.dmEntityId))
    ).subscribe();
    this.cacheSubjectsService.documentUntrash$.pipe(
      tap(params => this.handleDocumentUntrash(params.dmEntityId))
    ).subscribe();
    this.cacheSubjectsService.documentShared$.pipe(
      tap(params => this.handleDocumentShared(params.dmEntityId))
    ).subscribe();
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

  findDocumentVersions(uid: number): Array<DocumentVersionWithMetaValues> {
    const documentCacheData = this.getDocumentCacheData(uid);
    if (documentCacheData == null) {
      return null;
    }
    if (documentCacheData.versions == null) {
      this.documentVersionService.getDocumentVersions(this.sessionService.sessionToken, uid).pipe(
        map(documentVersions => documentVersions.map(version => new DocumentVersionWithMetaValues(version, null))),
        tap(documentVersions => this.updateDocumentVersions(uid, documentVersions))
      ).subscribe();
    }
  }

  private updateDocumentVersions(uid: number, versions: Array<DocumentVersionWithMetaValues>): void {
    const documentCacheData = this.getDocumentCacheData(uid);
    documentCacheData.versions = versions;
    this.entitiesCache.set(uid, documentCacheData);
  }

  findDocumentInCache(uid: number): Observable<DMEntityWrapper> {
    const documentInCache = this.getDocumentCacheData(uid);

    return documentInCache == null ?
        this.initDocumentInCache(uid).pipe(
          tap(documentWrapper => this.appendDocumentToFolder(documentWrapper.dmEntity as KimiosDocument)),
          tap(documentWrapper => this.newEntity$.next(documentWrapper))
        ) :
        of(this.entityCacheDataToDMEntityWrapper(documentInCache));
  }

  public entityCacheDataToDMEntityWrapper(entityCacheData: EntityCacheData): DMEntityWrapper {
    return entityCacheData != null ?
      <DMEntityWrapper> {
        dmEntity: entityCacheData.entity as KimiosDocument,
        canRead: entityCacheData.canRead,
        canWrite: entityCacheData.canWrite,
        hasFullAccess: entityCacheData.hasFullAccess
      } :
      null;
  }

  public dMEntityWrapperToEntityCacheData(wrapper: DMEntityWrapper): EntityCacheData | DocumentCacheData {
    return DMEntityUtils.dmEntityIsDocument(wrapper.dmEntity) ?
      new DocumentCacheData(wrapper.dmEntity, wrapper.canRead, wrapper.canWrite, wrapper.hasFullAccess) :
      new EntityCacheData(wrapper.dmEntity, wrapper.canRead, wrapper.canWrite, wrapper.hasFullAccess);
  }

  findDocumentVersionsInCache(uid: number, reload = false): Observable<Array<DocumentVersionWithMetaValues>> {
    return (this.getDocumentCacheData(uid) == null ?
      this.initDocumentDataInCache(uid) :
      of(this.getDocumentCacheData(uid))
    ).pipe(
      tap(documentCacheData => console.dir(documentCacheData)),
      concatMap(documentCacheData => documentCacheData == null ?
        of(null) :
        this.getDocumentCacheDataWithVersions(documentCacheData, reload)
      ),
      tap(documentCacheData => console.dir(documentCacheData)),
      map(documentCacheData => documentCacheData instanceof DocumentCacheData ? documentCacheData.versions : null)
    );
  }

  private initDocumentDataInCache(uid: number): Observable<DocumentCacheData> {
    return this.documentService.getDocumentWrapper(this.sessionService.sessionToken, uid).pipe(
      map(doc =>  doc != null ?
        null :
        new DocumentCacheData(doc.dmEntity, doc.canRead, doc.canWrite, doc.hasFullAccess)
      ),
    );
  }
  
  retrievePermissions(uid: number): Observable<EntityPermissions> {
    return combineLatest(
      this.securityService.canRead(this.sessionService.sessionToken, uid),
      this.securityService.canWrite(this.sessionService.sessionToken, uid),
      this.securityService.hasFullAccess(this.sessionService.sessionToken, uid)
    ).pipe(
      map(([read, write, fullAccess]) => <EntityPermissions>{
        canRead: read,
        canWrite: write,
        hasFullAccess: fullAccess
      })
    );
  }

  private initDocumentInCache(uid: number): Observable<DMEntityWrapper> {
    return this.initBookmarks().pipe(
      concatMap(() => this.documentService.getDocumentWrapper(this.sessionService.sessionToken, uid)),
      map(entityWrapper => {
        if (entityWrapper == null || entityWrapper === undefined) {
          return null;
        }
        if (this.bookmarks.filter(element => element.entity.uid === entityWrapper.dmEntity.uid).length > 0) {
          entityWrapper.dmEntity.bookmarked = true;
        }
        return entityWrapper;
      }),
      tap((entityWrapper) => {
        if (entityWrapper != null) {
          this.entitiesCache.set(
            entityWrapper.dmEntity.uid,
            new DocumentCacheData(entityWrapper.dmEntity, entityWrapper.canRead, entityWrapper.canWrite, entityWrapper.hasFullAccess)
          );
        }
      })
    );
  }

  private updateDocumentCacheDataVersions(documentCacheData: DocumentCacheData): Observable<DocumentCacheData> {
    return this.documentVersionService.getDocumentVersions(this.sessionService.sessionToken, documentCacheData.entity.uid).pipe(
      map(documentVersions => {
        documentCacheData.versions = documentVersions.map(version => new DocumentVersionWithMetaValues(version, null));
        this.entitiesCache.set(documentCacheData.entity.uid, documentCacheData);
        return this.getDocumentCacheData(documentCacheData.entity.uid);
      })
    );
  }

  private getDocumentCacheDataWithVersions(documentCacheData: DocumentCacheData, reload = false): Observable<DocumentCacheData> {
    return documentCacheData.versions == null || reload === true ?
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

  public findEntityChildrenInCache(uidParam: number, onlyContainers: boolean): Observable<Array<DMEntityWrapper>> {
    const idInHierarchy = uidParam == null ? 0 : uidParam;
    return from(of(uidParam)).pipe(
      concatMap(uid =>
        (this.entitiesHierarchyCache.get(idInHierarchy) == null
          || this.entitiesHierarchyCache.get(idInHierarchy) === undefined) ?
          this.initHierarchyCacheForEntity(uid) :
          of(
            this.entitiesHierarchyCache.get(idInHierarchy)
              .map(entityUid => this.entityCacheDataToDMEntityWrapper(this.entitiesCache.get(entityUid)))
          )
      ),
      concatMap(entityList => onlyContainers === true ?
        of(entityList.filter(entityWrapper =>
          DMEntityUtils.dmEntityIsFolder(entityWrapper.dmEntity)
          || DMEntityUtils.dmEntityIsWorkspace(entityWrapper.dmEntity)
        )) :
        of(entityList)
      )
    );
  }

  public reloadEntityChildren(uid: number): Observable<Array<DMEntityWrapper>> {
    return this.initHierarchyCacheForEntity(uid);
  }

  public removeEntityInCache(uid: number): void {
    const entityCacheData = this.entitiesCache.get(uid);
    if (entityCacheData == null) {
      return;
    }
    const entity = entityCacheData.entity;
    let parentUid = 0;
    if (DMEntityUtils.dmEntityIsDocument(entity)) {
      parentUid = (entity as KimiosDocument).folderUid;
    } else {
      if (DMEntityUtils.dmEntityIsFolder(entity)) {
        parentUid = (entity as Folder).parentUid;
      }
    }
    const brothersAndSisters = this.entitiesHierarchyCache.get(parentUid);
    const idx = brothersAndSisters.findIndex(elem => elem === uid);
    if (idx !== -1) {
      brothersAndSisters.splice(idx, 1);
      this.entitiesHierarchyCache.set(parentUid, brothersAndSisters);
    }
    this.entitiesCache.delete(uid);
  }

  private initHierarchyCacheForEntity(uid: number): Observable<Array<DMEntityWrapper>> {
    return this.initBookmarks().pipe(
      concatMap(() => this.findEntitiesAtPathFromId(uid)),
      map(entityWrappers => entityWrappers.map(element => {
        if (this.bookmarks.findIndex(b => b.entity.uid === element.dmEntity.uid) !== -1) {
          element.dmEntity.bookmarked = true;
        } else {
          element.dmEntity.bookmarked = false;
        }
        return element;
      })),
      tap(entityList => entityList.forEach(entityWrapper => {
        this.entitiesCache.set(entityWrapper.dmEntity.uid, DMEntityUtils.dmEntityIsDocument(entityWrapper.dmEntity) ?
          new DocumentCacheData(
            entityWrapper.dmEntity as KimiosDocument,
            entityWrapper.canRead,
            entityWrapper.canWrite,
            entityWrapper.hasFullAccess
          ) :
          new EntityCacheData(
            entityWrapper.dmEntity,
            entityWrapper.canRead,
            entityWrapper.canWrite,
            entityWrapper.hasFullAccess
          )
        );
      })),
      tap(entityList => this.entitiesHierarchyCache.set(uid == null ? 0 : uid, entityList.map(entityWrapper => entityWrapper.dmEntity.uid)))
    );
  }

  public askFoldersInFolders(uids: Array<number>): Observable<any> {
    return this.folderService.getFoldersFolders(<FolderUidListParam> {
      sessionId: this.sessionService.sessionToken,
      folderUidList: uids
    });
  }

  public findEntityInCache(entityUid: number): Observable<DMEntity> {
    return this.entitiesCache.get(entityUid) != null ?
      of(this.entitiesCache.get(entityUid).entity) :
      this.initEntityInCache(entityUid).pipe(
        map(wrapper => wrapper.dmEntity)
      );
  }

  public findEntityWrapperInCache(entityUid: number): Observable<DMEntityWrapper> {
    return this.entitiesCache.get(entityUid) != null ?
      of(this.entitiesCache.get(entityUid)) :
      this.initEntityInCache(entityUid);
  }

  private initEntityInCache(entityUid: number): Observable<DMEntityWrapper> {
    return this.initBookmarks().pipe(
      concatMap(bookmarks => this.retrieveEntity(entityUid)),
      filter(entityWrapper => entityWrapper != null),
      map(entityWrapper => {
        if (this.bookmarks.filter(element => element.entity.uid === entityWrapper.dmEntity.uid).length > 0) {
          entityWrapper.dmEntity.bookmarked = true;
        }
        return entityWrapper;
      }),
      tap(entityWrapper => this.entitiesCache.set(entityWrapper.dmEntity.uid, this.dMEntityWrapperToEntityCacheData(entityWrapper)))
    );
  }

  public findContainerEntityInCache(entityUid): Observable<DMEntity> {
    return this.entitiesCache.get(entityUid) != null ?
      of(this.entitiesCache.get(entityUid).entity) :
      this.initContainerEntityInCache(entityUid).map(wrapper => wrapper.dmEntity);
  }

  public findContainerEntityWrapperInCache(entityUid): Observable<DMEntityWrapper> {
    return this.entitiesCache.get(entityUid) != null ?
      of(this.entityCacheDataToDMEntityWrapper(this.entitiesCache.get(entityUid))) :
      this.initContainerEntityInCache(entityUid);
  }

  private retrieveEntity(uid: number): Observable<DMEntityWrapper> {
    return this.retrieveContainerEntity(uid).pipe(
      concatMap(res => res == null || res === undefined || res === '' ?
        this.documentService.getDocumentWrapper(this.sessionService.sessionToken, uid) :
        of(res)
      ));
  }

  private retrieveContainerEntity(uid: number): Observable<DMEntityWrapper> {
    return this.getEntity(uid) != null ?
      DMEntityUtils.dmEntityIsFolder(this.getEntity(uid)) ?
        this.retrieveFolderEntity(uid) :
        this.retrieveWorkspaceEntity(uid) :
      this.retrieveFolderEntity(uid).pipe(
        switchMap(
          res => of(res).catch(error => of(error))
        ),
        catchError(error => {
          return of('');
        }),
        concatMap(
          res => (res == null || res === undefined || res === '') ?
            this.retrieveWorkspaceEntity(uid) :
            of(res)
        )
      );
  }

  private retrieveWorkspaceEntity(uid: number): Observable<DMEntityWrapper> {
    return this.workspaceService.getWorkspaceWrapper(this.sessionService.sessionToken, uid).pipe(
      switchMap(
        res => of(res).catch(error => of(error))
      ),
      catchError(error => {
        return of('');
      }),
      map(res => res)
    );
  }

  private retrieveFolderEntity(uid: number): Observable<DMEntityWrapper> {
    return this.folderService.getFolderWrapper(this.sessionService.sessionToken, uid).pipe(
      switchMap(
        res => of(res).catch(error => of(error))
      ),
      catchError(error => {
        return of('');
      }),
      map(res => res)
    );
  }

  private initContainerEntityInCache(entityUid: number): Observable<DMEntityWrapper> {
    console.log('initContainerEntityInCache( ' + entityUid + ' )' );

    if (this.getEntity(entityUid) != null) {
      console.log('not null' );
      return of(null);
    }

    return this.retrieveContainerEntity(entityUid).pipe(
      filter(entityWrapper => entityWrapper != null),
      tap(entityWrapper => this.entitiesCache.set(
        entityWrapper.dmEntity.uid,
        this.dMEntityWrapperToEntityCacheData(entityWrapper)
      )),
      tap(wrapper => {
        if (DMEntityUtils.dmEntityIsFolder((wrapper.dmEntity))) {
           this.appendFolderToParent(wrapper.dmEntity);
        }
      })
    );
  }

  public findWorkspaceInCache(uid: number): Observable<DMEntityWrapper> {
    return (this.getWorkspaceInCache(uid) == null ?
      this.initContainerEntityInCache(uid) :
      of(this.getWorkspaceInCache(uid))
    ).pipe(
      concatMap(entityWrapper => entityWrapper != null && DMEntityUtils.dmEntityIsWorkspace(entityWrapper.dmEntity) ?
        of(entityWrapper) :
        of(null)
      )
    );
  }

  private getWorkspaceInCache(uid: number): DMEntityWrapper {
    const entityCacheData = this.entitiesCache.get(uid);
    if (entityCacheData && DMEntityUtils.dmEntityIsWorkspace(entityCacheData.entity)) {
      return this.entityCacheDataToDMEntityWrapper(entityCacheData);
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
      return this.initBookmarks().pipe(
        concatMap(() => this.updateEntityInCache(entity)),
        tap(ent => this.reloadedEntity$.next(ent))
      );
    } else {
      return this.initBookmarks().pipe(
        concatMap(() =>  this.initEntityInCache(uid)),
        map(wrapper => wrapper.dmEntity),
        tap(ent => this.reloadedEntity$.next(ent))
      );
    }
  }

  private updateEntityInCache(entity: DMEntity): Observable<DMEntity> {
    if (DMEntityUtils.dmEntityIsDocument(entity)) {
      return this.documentService.getDocumentWrapper(this.sessionService.sessionToken, entity.uid).pipe(
        filter(docWrapper => docWrapper != null),
        map(docWrapper => {
          if (this.bookmarks.filter(element => element.entity.uid === docWrapper.dmEntity.uid).length > 0) {
            docWrapper.dmEntity.bookmarked = true;
          }
          return docWrapper;
        }),
        tap(docWrapper =>
            this.entitiesCache.set(
              docWrapper.dmEntity.uid,
              new EntityCacheData(docWrapper.dmEntity, docWrapper.canRead, docWrapper.canWrite, docWrapper.hasFullAccess)
            )
        ),
        map(docWrapper => docWrapper.dmEntity)
      );
    } else {
      if (DMEntityUtils.dmEntityIsFolder(entity)) {
        return this.folderService.getFolderWrapper(this.sessionService.sessionToken, entity.uid).pipe(
          filter(folderWrapper => folderWrapper != null),
          map(folderWrapper => {
            if (this.bookmarks.filter(element => element.entity.uid === folderWrapper.dmEntity.uid).length > 0) {
              folderWrapper.dmEntity.bookmarked = true;
            }
            return folderWrapper;
          }),
          tap(folderWrapper =>
              this.entitiesCache.set(
                folderWrapper.dmEntity.uid,
                new EntityCacheData(folderWrapper.dmEntity, folderWrapper.canRead, folderWrapper.canWrite, folderWrapper.hasFullAccess)
              )
            ),
          map(folderWrapper => folderWrapper.dmEntity)
        );
      } else {
        return this.workspaceService.getWorkspaceWrapper(this.sessionService.sessionToken, entity.uid).pipe(
          filter(workspaceWrapper => workspaceWrapper != null),
          map(workspaceWrapper => {
            if (this.bookmarks.filter(element => element.entity.uid === workspaceWrapper.dmEntity.uid).length > 0) {
              workspaceWrapper.dmEntity.bookmarked = true;
            }
            return workspaceWrapper;
          }),
          tap(workspaceWrapper =>
            this.entitiesCache.set(
              workspaceWrapper.dmEntity.uid,
              new EntityCacheData(workspaceWrapper.dmEntity, workspaceWrapper.canRead, workspaceWrapper.canWrite, workspaceWrapper.hasFullAccess)
            )
          ),
          map(workspaceWrapper => workspaceWrapper.dmEntity)
        );
      }
    }
  }

  findEntitiesAtPathFromId(parentUid?: number): Observable<Array<DMEntityWrapper>> {
    if (parentUid == null
      || parentUid === undefined) {
      return this.workspaceService.getWorkspaceWrappers(this.sessionService.sessionToken);
    } else {
      return this.retrieveContainerEntity(parentUid).pipe(
        concatMap(
          res => combineLatest(of(res), this.folderService.getFolderWrappers(this.sessionService.sessionToken, parentUid))
        ),
        concatMap(
          ([parentEntity, folders]) => combineLatest(
            of(folders),
            DMEntityUtils.dmEntityIsWorkspace(parentEntity.dmEntity) ?
              of([]) :
              this.documentService.getDocumentWrappers(this.sessionService.sessionToken, parentUid)
          )
        ),
        concatMap(
          ([folders, documents]) => of(folders.concat(documents))
        )
      );
    }
  }

  public findDocumentVersionWithMetaDataValues(documentUid: number, documentVersionUid: number):
    Observable<DocumentVersionWithMetaValues> {
      const documentCacheData = this.getDocumentCacheData(documentUid);
      if (documentCacheData == null) {
      return null;
    }
    return of(
      documentCacheData.versions != null ?
        documentCacheData.versions :
        this.findDocumentVersions(documentUid)
    ).pipe(
      map(versions => versions.filter(v => v.documentVersion.uid === documentVersionUid)[0]),
      concatMap(versionWithMetaDataValues =>
        versionWithMetaDataValues.metaValues == null ?
          this.initDocumentVersionMetaDataValues(documentUid, documentVersionUid) :
          of(versionWithMetaDataValues)
      )
    );
  }

  private initDocumentVersionMetaDataValues(documentUid: number, documentVersionUid: number):
    Observable<DocumentVersionWithMetaValues> {
    const documentCacheData = this.getDocumentCacheData(documentUid);
    if (documentCacheData == null) {
      return null;
    }
    return of(
      documentCacheData.versions != null ?
        documentCacheData.versions :
        this.findDocumentVersions(documentUid)
    ).pipe(
      concatMap(versions => combineLatest(
        of(this.getDocumentCacheData(documentUid).versions
          .filter(v => v.documentVersion.uid === documentVersionUid)[0]),
        this.documentVersionService.getMetaValues(this.sessionService.sessionToken, documentVersionUid),
        this.documentVersionService.getMetas(
          this.sessionService.sessionToken,
          this.getDocumentCacheData(documentUid).versions
            .filter(v => v.documentVersion.uid === documentVersionUid)[0].documentVersion.documentTypeUid
        ))
      ),
      map(([version, metaValues, metas]) => new DocumentVersionWithMetaValues(
        version.documentVersion,
        metas.map(meta => {
          const idx = metaValues.findIndex(mv => mv.metaId === meta.uid);
          const metaValue = idx !== -1 ?
            metaValues[idx] :
            <MetaValue> {
              metaId: meta.uid,
              meta: meta,
              documentVersionId: documentVersionUid,
              value: null
            };
          return metaValue;
        })
      )),
      tap(documentVersionWithMetaValues => {
        const idx = documentCacheData.versions
          .findIndex(v => v.documentVersion.uid === documentVersionWithMetaValues.documentVersion.uid);
        if (idx !== -1) {
          documentCacheData.versions[idx] = documentVersionWithMetaValues;
          this.entitiesCache.set(documentCacheData.entity.uid, documentCacheData);
        }
      })
    );
  }

  private initBookmarks(): Observable<Array<Bookmark>> {
    return this.documentService.getBookmarks(this.sessionService.sessionToken).pipe(
      tap(bookmarks => this.bookmarks = bookmarks)
    );
  }

  public findBookmarksInCache(): Observable<Array<Bookmark>> {
    if (this.bookmarks == null) {
      return this.initBookmarks();
    } else {
      return of(this.bookmarks);
    }
  }

  public reloadBookmarks(): Observable<Array<Bookmark>> {
    return this.initBookmarks();
  }

  private appendDocumentToFolder(document: KimiosDocument): void {
    const folder = this.getEntity(document.folderUid);
    if (folder == null) {
      this.documentService.retrieveDocumentParentWrappers(this.sessionService.sessionToken, document.uid).pipe(
        tap(parents => {
          const directParent = parents.shift();
          const directParentCacheData = this.entitiesCache.get(directParent.dmEntity.uid);
          if (directParentCacheData == null) {
            this.entitiesCache.set(
              directParent.dmEntity.uid,
              new EntityCacheData(directParent.dmEntity, directParent.canRead, directParent.canWrite, directParent.hasFullAccess)
            );
            this.newEntity$.next(directParent);
          }
          const containerHierarchyInCache = this.entitiesHierarchyCache.get(directParent.dmEntity.uid);
          if (containerHierarchyInCache == null) {
            this.entitiesHierarchyCache.set(directParent.dmEntity.uid, new Array<number>());
          }
          this.entitiesHierarchyCache.get(directParent.dmEntity.uid).push(document.uid);

          this.appendDMEntityToParentRec(parents, directParent.dmEntity);
        })
      ).subscribe();
    } else {
      const entityHierarchyCache = this.entitiesHierarchyCache.get(folder.uid);
      if (entityHierarchyCache != null
        && entityHierarchyCache.findIndex(element => element === document.uid) === -1) {
        this.entitiesHierarchyCache.get(folder.uid).push(document.uid);
      }
    }
  }

  private appendFolderToParent(folder: Folder): void {
    // parent must have been loaded
    if (this.entitiesHierarchyCache.get(folder.parentUid) != null
    && ! this.entitiesHierarchyCache.get(folder.parentUid).includes(folder.uid)) {
      this.entitiesHierarchyCache.get(folder.parentUid).push(folder.uid);
    }
  }

  private appendDMEntityToParentRec(parents: Array<DMEntityWrapper>, entity: DMEntity): void {
    if (parents.length === 0) {
      return;
    } else {
      const directParent = parents.shift();
      const directParentCacheData = this.entitiesCache.get(directParent.dmEntity.uid);
      if (directParentCacheData == null) {
        this.entitiesCache.set(
          directParent.dmEntity.uid,
          new EntityCacheData(directParent.dmEntity, directParent.canRead, directParent.canWrite, directParent.hasFullAccess)
        );
        this.newEntity$.next(directParent);
      }
      const containerHierarchyInCache = this.entitiesHierarchyCache.get(directParent.dmEntity.uid);
      if (containerHierarchyInCache == null) {
        this.entitiesHierarchyCache.set(directParent.dmEntity.uid, new Array<number>());
      }
      if (this.entitiesHierarchyCache.get(directParent.dmEntity.uid).findIndex(element => element === entity.uid) === -1) {
        this.entitiesHierarchyCache.get(directParent.dmEntity.uid).push(entity.uid);
      }
      this.appendDMEntityToParentRec(parents, directParent.dmEntity);
    }
  }

  private createAllParentFoldersRec(entity: DMEntity): Observable<Array<DMEntity>> {
    const parentUid = DMEntityUtils.dmEntityIsDocument(entity) ? (entity as KimiosDocument).folderUid : (entity as Folder).parentUid;
    const containerEntity = this.getEntity(parentUid);
    // if (containerEntity == null) {
      return this.findAllParents(entity.uid);
    /*} else {
      return of([]);
    }*/
  }

  findAllParentsRec(uid: number, includeEntity: boolean = false): Observable<DMEntityWrapper> {
    return this.findContainerEntityWrapperInCache(uid).pipe(
      expand(
        res => res !== undefined && (DMEntityUtils.dmEntityIsFolder(res.dmEntity) /*|| DMEntityUtils.dmEntityIsWorkspace(res)*/) ?
          this.findContainerEntityWrapperInCache(res.dmEntity['parentUid']) :
          of()
      ),
      map(res => res),
      filter(res => includeEntity || res.dmEntity.uid !== uid)
    );
  }

  findAllParents(uid: number, includeEntity: boolean = false): Observable<Array<DMEntity>> {
    return this.findAllParentsRec(uid, includeEntity).pipe(
      filter(elem => elem !== null && elem !== undefined && elem !== ''),
      map(wrapper => wrapper.dmEntity),
      toArray()
    );
  }

  findAllParentWrappers(uid: number, includeEntity: boolean = false): Observable<Array<DMEntityWrapper>> {
    return this.findAllParentsRec(uid, includeEntity).pipe(
      filter(elem => elem !== null && elem !== undefined && elem !== ''),
      toArray()
    );
  }

  handleDocumentCreated(documentWrapper: DMEntityWrapper): Observable<boolean> {
    if (
      this.entitiesCache.get(documentWrapper.dmEntity.uid) != null
      || this.entitiesCache.get((documentWrapper.dmEntity as KimiosDocument).folderUid) == null
    ) {
      return of(false);
    } else {
      this.entitiesCache.set(
        documentWrapper.dmEntity.uid,
        new DocumentCacheData(documentWrapper.dmEntity, documentWrapper.canRead, documentWrapper.canWrite, documentWrapper.hasFullAccess)
      );
      if (this.entitiesHierarchyCache.get((documentWrapper.dmEntity as KimiosDocument).folderUid) == null) {
        this.entitiesHierarchyCache.set((documentWrapper.dmEntity as KimiosDocument).folderUid, new Array<number>());
      }
      this.entitiesHierarchyCache.get((documentWrapper.dmEntity as KimiosDocument).folderUid).push(documentWrapper.dmEntity.uid);
      this.newEntity$.next(documentWrapper);
      return of(true);
    }
  }

  updateFolder(folderUid: number, folderName: string, folderParentUid: number): Observable<any> {
    return this.folderService.updateFolder(
      this.sessionService.sessionToken,
      folderUid,
      folderName,
      folderParentUid
    ).pipe(
      switchMap(
        response =>
          of(response)
            .catch(error => of(error))
      ),
      catchError(error => {
        return of(false);
      }),
      filter(res => res != false),
      concatMap(res => this.reloadEntity(folderUid)),
      tap(entity => this.reloadedEntity$.next(entity)),
      concatMap(() => this.reloadEntityChildren(folderParentUid))
    );
  }

  updateWorkspace(workspaceUid: number, workspaceName: string): Observable<any> {
    return this.workspaceService.updateWorkspace(
      this.sessionService.sessionToken,
      workspaceUid,
      workspaceName
    ).pipe(
      switchMap(
        response =>
          of(response)
            .catch(error => of(error))
      ),
      catchError(error => {
        return error;
      }),
      concatMap(() => this.reloadEntity(workspaceUid)),
      tap(entity => this.reloadedEntity$.next(entity))
    );
  }

  private checkDataMessagesQueue(): void {
    this._checkingDataMessagesQueue = true;
    let dataMessage = this.cacheService.dataMessages.shift();
    while (dataMessage !== undefined) {
      this.handleDataMessage(dataMessage);
      dataMessage = this.cacheService.dataMessages.shift();
    }
    this._checkingDataMessagesQueue = false;
  }

  private handleDataMessage(dataMessage: DataMessageImpl): void {
    // only folders are considered
    // TODO : consider also other entity types
    this.entitiesCache.set(
      dataMessage.parent.dmEntity.uid,
      new EntityCacheData(
        dataMessage.parent.dmEntity,
        dataMessage.parent.canRead,
        dataMessage.parent.canWrite,
        dataMessage.parent.hasFullAccess
      )
    );
    dataMessage.dmEntityList.forEach(dmEntityWrapper =>
      this.entitiesCache.set(
        dmEntityWrapper.dmEntity.uid,
        new EntityCacheData(
          dmEntityWrapper.dmEntity,
          dmEntityWrapper.canRead,
          dmEntityWrapper.canWrite,
          dmEntityWrapper.hasFullAccess
        )
      )
    );
    this.entitiesHierarchyCache.set(
      dataMessage.parent.dmEntity.uid,
      dataMessage.dmEntityList.map(dmEntityWrapper => dmEntityWrapper.dmEntity.uid)
    );
    this.folderWithChildren$.next(dataMessage.parent.dmEntity);
  }

  get checkingDataMessagesQueue(): boolean {
    return this._checkingDataMessagesQueue;
  }

  handleWorkspaceCreated(dmEntityId: number): void {
    this.initContainerEntityInCache(dmEntityId).pipe(
      tap(() => this.workspaceCreated$.next(dmEntityId))
    ).subscribe();
  }

  handleWorkspaceUpdated(dmEntityId: number): void {
    this.reloadEntity(dmEntityId).pipe(
      tap(() => this.workspaceUpdated$.next(dmEntityId))
    ).subscribe();
  }

  handleWorkspaceRemoved(dmEntityId: number): void {
    this.removeEntityInCache(dmEntityId);
    this.workspaceRemoved$.next(dmEntityId);
  }

  handleFolderCreated(dmEntityId: number): void {
    if (dmEntityId !== undefined) {
      this.initContainerEntityInCache(dmEntityId).pipe(
        filter(entity => entity != null),
        tap(() => this.folderCreated$.next(dmEntityId))
      ).subscribe();
    }
  }

  handleFolderUpdated(dmEntityId: number): void {
    this.reloadEntity(dmEntityId).pipe(
      tap(() => this.folderUpdated$.next(dmEntityId))
    ).subscribe();
  }

  handleFolderRemoved(dmEntityId: number): void {
    this.removeEntityInCache(dmEntityId);
    this.folderRemoved$.next(dmEntityId);
  }

  private handleDocumentUpdate(dmEntityId: number): void {
    this.reloadEntity(dmEntityId).pipe(
      tap(() => this.documentUpdate$.next(dmEntityId))
    ).subscribe();
  }

  private handleDocumentVersionCreated(dmEntityId: number): void {

  }

  private handleDocumentVersionUpdate(dmEntityId: number): void {
    this.findDocumentVersionsInCache(dmEntityId, true).pipe(
      concatMap(versions => this.initDocumentVersionMetaDataValues(dmEntityId, versions[0].documentVersion.uid)),
      tap(version => this.documentVersionUpdated$.next(version))
    ).subscribe();
  }

  private handleDocumentCheckout(dmEntityId: number): void {
    
  }

  private handleDocumentCheckin(dmEntityId: number): void {
    
  }

  private handleDocumentRemoved(dmEntityId: number): void {
    
  }

  private handleDocumentAddRelated(dmEntityId: number): void {
    
  }

  private handleDocumentRemoveRelated(dmEntityId: number): void {
    
  }

  private handleDocumentVersionCreateFromLatest(dmEntityId: number): void {
    this.findDocumentVersionsInCache(dmEntityId, true).pipe(
      tap(() => this.documentVersionCreated$.next(dmEntityId))
    ).subscribe();
  }

  private handleDocumentVersionRead(dmEntityId: number): void {
    
  }

  private handleMetaValueUpdate$(dmEntityId: number): void {
    
  }

  private handleDocumentVersionCommentCreate(dmEntityId: number): void {
    
  }

  private handleDocumentVersionCommentUpdate(dmEntityId: number): void {
    
  }

  private handleDocumentVersionCommentDelete(dmEntityId: number): void {
    
  }

  private handleDocumentTrash(dmEntityId: number): void {
    
  }

  private handleDocumentUntrash(dmEntityId: number): void {
    
  }

  private handleDocumentShared(dmEntityId: number): void {
    
  }
}
