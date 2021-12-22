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
  MetaValue,
  Workspace,
  WorkspaceService
} from 'app/kimios-client-api';
import {SessionService} from './session.service';
import {catchError, concatMap, expand, filter, map, switchMap, tap, toArray} from 'rxjs/operators';
import {BehaviorSubject, combineLatest, from, Observable, of, Subject} from 'rxjs';
import {SearchEntityService} from './searchentity.service';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';

@Injectable({
  providedIn: 'root'
})
export class EntityCacheService {

  private entitiesCache: Map<number, EntityCacheData>;
  private entitiesHierarchyCache: Map<number, Array<number>>;
  private allTags: Map<string, number>;
  private bookmarks: Array<Bookmark>;
  public reloadedEntity$: BehaviorSubject<DMEntity>;
  public newEntity$: BehaviorSubject<DMEntity>;
  public chosenParentUid$: Subject<number>;

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
    this.reloadedEntity$ = new BehaviorSubject<DMEntity>(null);
    this.newEntity$ = new BehaviorSubject<DMEntity>(null);
    this.chosenParentUid$ = new Subject<number>();
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

  findDocumentInCache(uid: number): Observable<KimiosDocument> {
    const documentInCache = this.getDocumentCacheData(uid);

    return documentInCache == null ?
        this.initBookmarks().pipe(
          concatMap(bookmarks => this.documentService.getDocument(this.sessionService.sessionToken, uid)),
          map(doc => {
            if (this.bookmarks.filter(element => element.entity.uid === doc.uid).length > 0) {
              doc.bookmarked = true;
            }
            return doc;
          }),
          tap(document => this.entitiesCache.set(uid, new EntityCacheData(document))),
          tap(document => this.appendDocumentToFolder(document)),
          tap(document => this.newEntity$.next(document))
        ) :
        of(documentInCache.entity);
  }

  findDocumentVersionsInCache(uid: number): Observable<Array<DocumentVersionWithMetaValues>> {
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
        documentCacheData.versions = documentVersions.map(version => new DocumentVersionWithMetaValues(version, null));
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

  private initHierarchyCacheForEntity(uid: number): Observable<Array<DMEntity>> {
    return this.initBookmarks().pipe(
      concatMap(() => this.findEntitiesAtPathFromId(uid)),
      map(entities => entities.map(element => {
        if (this.bookmarks.findIndex(b => b.entity.uid === element.uid) !== -1) {
          element.bookmarked = true;
        } else {
          element.bookmarked = false;
        }
        return element;
      })),
      tap(entityList => entityList.forEach(entity => {
        this.entitiesCache.set(entity.uid, DMEntityUtils.dmEntityIsDocument(entity) ?
          new DocumentCacheData(entity as KimiosDocument) :
          new EntityCacheData(entity));
      })),
      tap(entityList => this.entitiesHierarchyCache.set(uid == null ? 0 : uid, entityList.map(entity => entity.uid)))
    );
  }

  public findEntityInCache(entityUid: number): Observable<DMEntity> {
    return this.entitiesCache.get(entityUid) != null ?
      of(this.entitiesCache.get(entityUid).entity) :
      this.initEntityInCache(entityUid);
  }

  private initEntityInCache(entityUid: number): Observable<DMEntity> {
    return this.initBookmarks().pipe(
      concatMap(bookmarks => this.retrieveEntity(entityUid)),
      map(entity => {
        if (this.bookmarks.filter(element => element.entity.uid === entity.uid).length > 0) {
          entity.bookmarked = true;
        }
        return entity;
      }),
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
          res => (res == null || res === undefined || res === '') ?
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
      return this.initBookmarks().pipe(
        concatMap(() => this.updateEntityInCache(entity)),
        tap(ent => this.reloadedEntity$.next(ent))
      );
    } else {
      return this.initBookmarks().pipe(
        concatMap(() =>  this.initEntityInCache(uid)),
        tap(ent => this.reloadedEntity$.next(ent))
      );
    }
  }

  private updateEntityInCache(entity: DMEntity): Observable<DMEntity> {
    if (DMEntityUtils.dmEntityIsDocument(entity)) {
      return this.documentService.getDocument(this.sessionService.sessionToken, entity.uid).pipe(
        map(doc => {
          if (this.bookmarks.filter(element => element.entity.uid === doc.uid).length > 0) {
            doc.bookmarked = true;
          }
          return doc;
        }),
        tap(res => {
          if (res != null && res !== undefined && res !== '') {
            this.entitiesCache.set(res.uid, new EntityCacheData(res));
          }
        })
      );
    } else {
      if (DMEntityUtils.dmEntityIsFolder(entity)) {
        return this.folderService.getFolder(this.sessionService.sessionToken, entity.uid).pipe(
          map(folder => {
            if (this.bookmarks.filter(element => element.entity.uid === folder.uid).length > 0) {
              folder.bookmarked = true;
            }
            return folder;
          }),
          tap(res => {
            if (res != null && res !== undefined && res !== '') {
              this.entitiesCache.set(res.uid, new EntityCacheData(res));
            }
          })
        );
      } else {
        return this.workspaceService.getWorkspace(this.sessionService.sessionToken, entity.uid).pipe(
          map(workspace => {
            if (this.bookmarks.filter(element => element.entity.uid === workspace.uid).length > 0) {
              workspace.bookmarked = true;
            }
            return workspace;
          }),
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
    if (parentUid == null
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
      this.documentService.retrieveDocumentParents(this.sessionService.sessionToken, document.uid).pipe(
        tap(parents => {
          const directParent = parents.shift();
          const directParentCacheData = this.entitiesCache.get(directParent.uid);
          if (directParentCacheData == null) {
            this.entitiesCache.set(directParent.uid, new EntityCacheData(directParent));
            this.newEntity$.next(directParent);
          }
          const containerHierarchyInCache = this.entitiesHierarchyCache.get(directParent.uid);
          if (containerHierarchyInCache == null) {
            this.entitiesHierarchyCache.set(directParent.uid, new Array<number>());
          }
          this.entitiesHierarchyCache.get(directParent.uid).push(document.uid);

          this.appendDMEntityToParentRec(parents, directParent);
        })
      ).subscribe();
    } else {
      if (this.entitiesHierarchyCache.get(folder.uid).findIndex(element => element === document.uid) === -1) {
        this.entitiesHierarchyCache.get(folder.uid).push(document.uid);
      }
    }
  }

  private appendDMEntityToParentRec(parents: Array<DMEntity>, entity: DMEntity): void {
    if (parents.length === 0) {
      return;
    } else {
      const directParent = parents.shift();
      const directParentCacheData = this.entitiesCache.get(directParent.uid);
      if (directParentCacheData == null) {
        this.entitiesCache.set(directParent.uid, new EntityCacheData(directParent));
        this.newEntity$.next(directParent);
      }
      const containerHierarchyInCache = this.entitiesHierarchyCache.get(directParent.uid);
      if (containerHierarchyInCache == null) {
        this.entitiesHierarchyCache.set(directParent.uid, new Array<number>());
      }
      if (this.entitiesHierarchyCache.get(directParent.uid).findIndex(element => element === entity.uid) === -1) {
        this.entitiesHierarchyCache.get(directParent.uid).push(entity.uid);
      }
      this.appendDMEntityToParentRec(parents, directParent);
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

  findAllParentsRec(uid: number, includeEntity: boolean = false): Observable<DMEntity> {
    return this.findContainerEntityInCache(uid).pipe(
      expand(
        res => res !== undefined && (DMEntityUtils.dmEntityIsFolder(res) /*|| DMEntityUtils.dmEntityIsWorkspace(res)*/) ?
          this.findContainerEntityInCache(res['parentUid']) :
          of()
      ),
      map(res => res),
      filter(res => includeEntity || res.uid !== uid)
    );
  }

  findAllParents(uid: number, includeEntity: boolean = false): Observable<Array<DMEntity>> {
    const parents = new Array<DMEntity>();
    return this.findAllParentsRec(uid, includeEntity).pipe(
      filter(elem => elem !== null && elem !== undefined && elem !== ''),
      toArray()
    );
  }

  handleDocumentCreated(document: KimiosDocument): Observable<boolean> {
    if (
      this.entitiesCache.get(document.uid) != null
      || this.entitiesCache.get(document.folderUid) == null
    ) {
      return of(false);
    } else {
      this.entitiesCache.set(document.uid, new DocumentCacheData(document));
      this.entitiesHierarchyCache.get(document.folderUid).push(document.uid);
      this.newEntity$.next(document);
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
        console.log('error while folder update');
        return error;
      }),
      concatMap(() => this.reloadEntity(folderUid)),
      tap(entity => this.reloadedEntity$.next(entity)),
      concatMap(() => this.reloadEntityChildren(folderParentUid))
    );
  }
}
