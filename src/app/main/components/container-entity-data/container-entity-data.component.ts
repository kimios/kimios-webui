import {Component, Input, OnInit} from '@angular/core';
import {AdministrationService, DMEntity, Folder, FolderService, SecurityService, User, Workspace} from 'app/kimios-client-api';
import {FormBuilder, FormGroup} from '@angular/forms';
import {combineLatest, Observable, of} from 'rxjs';
import {concatMap, filter, map, startWith, tap} from 'rxjs/operators';
import {CacheSecurityService} from 'app/services/cache-security.service';
import {EntityCacheService} from 'app/services/entity-cache.service';
import {SessionService} from 'app/services/session.service';
import {BrowseTreeDialogComponent} from 'app/main/components/browse-tree-dialog/browse-tree-dialog.component';
import {MatDialog} from '@angular/material';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {BROWSE_TREE_MODE} from 'app/main/model/browse-tree-mode.enum';
import {TreeNodeMoveUpdate} from 'app/main/model/tree-node-move-update';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {DMEntityWrapper} from 'app/kimios-client-api/model/dMEntityWrapper';

@Component({
  selector: 'container-entity-data',
  templateUrl: './container-entity-data.component.html',
  styleUrls: ['./container-entity-data.component.scss']
})
export class ContainerEntityDataComponent implements OnInit {
  @Input()
  entityWrapper: DMEntityWrapper;
  @Input()
  entityType: string;
  entityEditForm: FormGroup;
  filteredUsers$: Observable<Array<User>>;
  allUsers: Array<User>;
  init = false;
  entityOwner: User;
  isAdmin$: Observable<boolean>;
  isAdmin = false;
  canBeMoved = false;
  isWriteable = false;
  parentEntity: Folder | Workspace = null;
  parentEntityWanted: Folder | Workspace;
  precedingParentUid: number;
  location: string;

  constructor(
    private fb: FormBuilder,
    private cacheSecurityService: CacheSecurityService,
    private entityCacheService: EntityCacheService,
    private sessionService: SessionService,
    private folderService: FolderService,
    public dialog: MatDialog,
    private administrationService: AdministrationService,
    private browseEntityService: BrowseEntityService,
    private securityService: SecurityService
  ) {

  }

  ngOnInit(): void {
    this.precedingParentUid = DMEntityUtils.dmEntityIsFolder(this.entityWrapper.dmEntity) ?
      (this.entityWrapper.dmEntity as Folder).parentUid :
      null;

    this.entityEditForm = this.fb.group({
      'name': this.fb.control(this.entityWrapper.dmEntity.name),
      'owner': this.fb.control('')
    });

    this.filteredUsers$ = this.entityEditForm.get('owner').valueChanges
      .pipe(
        filter(searchTerm => searchTerm != null),
        startWith(''),
        filter(searchTerm => typeof searchTerm === 'string'),
        concatMap(searchTerm => combineLatest(
          of(searchTerm),
          this.cacheSecurityService.retrieveUsersWithSearchTerm(searchTerm)
        )),
        tap(([searchTerm, users]) => {
          if (searchTerm === '') {
            this.allUsers = users;
          }
        }),
        tap(([searchTerm, users]) => {
          if (this.init === false) {
            const owner = this.extractEntityOwnerFromAllUsers(users, this.entityWrapper.dmEntity);
            if (owner != null) {
              this.entityOwner = owner;
              this.entityEditForm.get('owner').setValue(owner);
            }
            this.init = true;
          }
        }),
        map(([searchTerm, users]) => users)
      );

    this.isAdmin$ = this.sessionService.currentUserIsAdmin().pipe(
      tap(res => this.isAdmin = res)
    );

    this.folderService.canBeMoved(this.sessionService.sessionToken, this.entityWrapper.dmEntity.uid).subscribe(
      res => this.canBeMoved = res,
      error => this.canBeMoved = false
    );

    this.isWriteable = this.entityWrapper.canWrite;

    of('').pipe(
      concatMap(() => DMEntityUtils.dmEntityIsWorkspace(this.entityWrapper.dmEntity) ?
        of(null) :
        this.entityCacheService.findContainerEntityInCache((this.entityWrapper.dmEntity as Folder).parentUid)
      ),
      tap(parentFolder => this.parentEntity = parentFolder),
      tap(parentFolder => this.location =
        parentFolder == null ?
          '/' :
          parentFolder.path
      )
    ).subscribe();

    this.entityCacheService.chosenParentUid$.pipe(
      startWith(DMEntityUtils.dmEntityIsWorkspace(this.entityWrapper.dmEntity) ? null : (this.entityWrapper.dmEntity as Folder).parentUid),
      concatMap(uid => uid == null ? of(null) : this.entityCacheService.findEntityInCache(uid)),
      tap(parent => this.parentEntityWanted = parent)
    ).subscribe();

    this.entityEditForm.statusChanges.pipe(
      tap(() => this.updateDirtyFormStatus())
    ).subscribe();

    this.entityEditForm.valueChanges.pipe(
      tap(() => this.updateDirtyFormStatus())
    ).subscribe();
  }

  updateDirtyFormStatus(): void {
    if (this.entityEditForm.dirty
      || (this.parentEntity != null && this.parentEntity.uid !== this.parentEntityWanted.uid)) {
      this.sessionService.dirtyForm$.next(true);
    } else {
      this.sessionService.dirtyForm$.next(false);
    }
  }

  submit(): void {
    if (this.entityEditForm.invalid
      || (! this.entityEditForm.dirty
        && (DMEntityUtils.dmEntityIsFolder(this.entityWrapper.dmEntity)
          && (this.parentEntityWanted == null
            || (this.entityWrapper.dmEntity as Folder).parentUid === this.parentEntityWanted.uid)))) {
      return;
    }

    ((DMEntityUtils.dmEntityIsFolder(this.entityWrapper.dmEntity)
        && (this.entityEditForm.get('name').dirty
          || (this.parentEntityWanted != null
            && (this.entityWrapper.dmEntity as Folder).parentUid !== this.parentEntityWanted.uid))) ?
        this.entityCacheService.updateFolder(
          this.entityWrapper.dmEntity.uid,
          this.entityEditForm.get('name').value,
          this.parentEntityWanted.uid
        ) :
      (DMEntityUtils.dmEntityIsWorkspace(this.entityWrapper.dmEntity)
        && this.entityEditForm.get('name').dirty) ?
        this.entityCacheService.updateWorkspace(
          this.entityWrapper.dmEntity.uid,
          this.entityEditForm.get('name').value
        ) :
        of(null)
    ).pipe(
      concatMap(res =>
        this.isAdmin
        && (this.entityEditForm.get('owner').dirty) ?
          this.administrationService.changeOwnership(
            this.sessionService.sessionToken,
            this.entityWrapper.dmEntity.uid,
            this.entityEditForm.get('owner').value.uid,
            this.entityEditForm.get('owner').value.source
          ) :
          of(null)
      ),
      concatMap(res => this.entityCacheService.findEntityInCache(this.entityWrapper.dmEntity.uid)),
      tap(reloadedEntity => {
        if (this.precedingParentUid != null
          && this.precedingParentUid !== (reloadedEntity as Folder).parentUid) {
          this.browseEntityService.updateMoveTreeNode$.next(
            new TreeNodeMoveUpdate(
              reloadedEntity,
              this.entityCacheService.getEntity((reloadedEntity as Folder).parentUid),
              this.precedingParentUid
            )
          );
        }
      }),
      concatMap(reloadedEntity =>
        combineLatest(of(reloadedEntity), this.precedingParentUid != null
        && this.precedingParentUid !== (reloadedEntity as Folder).parentUid ?
          this.browseEntityService.updateListAfterMove(
            reloadedEntity,
            this.entityCacheService.getEntity((reloadedEntity as Folder).parentUid),
            this.precedingParentUid
          ) :
          of([])
      )),
      tap(([reloadedEntity, other]) => {
        this.entityWrapper.dmEntity = reloadedEntity;
        this.entityEditForm.get('name').setValue(this.entityWrapper.dmEntity.name);
        this.init = false;
        this.entityEditForm.get('owner').setValue('');
        this.sessionService.dirtyForm$.next(false);
      }),
    ).subscribe(
      /*res => console.log('folder updated'),
      error => console.log('error during update ' + error.error.message),
      null*/
    );
  }

  sendEventResetSearch(): void {
    
  }

  handleClick(): void {

  }

  displayWithFunc(user: User): string {
    return user != null && user !== '' ?
      user.firstName
      + ' '
      + user.lastName
      + ' (' + user.uid + '@' + user.source
      + ')' :
      '';
  }

  pathWithoutEntity(path: string): string {
    const regexp = /^(.*)(\/[^\/]+)$/;
    const match = path.match(regexp);
    if (match === [''] || match.length < 3) {
      return '';
    } else {
      return match[1] === '' ? '/' : path.replace(match[2], '');
    }
  }

  clearOwner(): void {
    this.entityEditForm.get('owner').setValue('', {onlySelf: true, emitEvent: false});
  }

  selectUser(): void {
  }

  handleOwnerFocusOut(): void {
    if (this.entityEditForm.get('owner').value === '') {
      this.entityEditForm.get('owner').setValue(this.entityOwner);
    }
  }

  reset(): void {
    this.resetEditForm();
    this.parentEntityWanted = this.parentEntity;
    this.sessionService.dirtyForm$.next(false);
  }

  private resetEditForm(): void {
    this.entityEditForm.get('name').setValue(this.entityWrapper.dmEntity.name);
    this.entityEditForm.get('owner').setValue(this.extractEntityOwnerFromAllUsers(this.allUsers, this.entityWrapper.dmEntity));
  }

  private extractEntityOwnerFromAllUsers(users: Array<User>, entity: DMEntity): User {
    const idx = users.findIndex(user => user.uid === entity.owner && user.source === entity.ownerSource);
    return idx !== -1 ?
      users[idx] :
      null;
  }

  openChooseFolderDialog(): void {
    const dialog = this.dialog.open(BrowseTreeDialogComponent, {
      data: {
        browseTreeMode: BROWSE_TREE_MODE.CHOOSE_PARENT
      }
    });

    dialog.afterClosed().pipe(
      tap(() => this.browseEntityService.browseMode$.next(BROWSE_TREE_MODE.BROWSE)),
      tap(() => this.sessionService.dirtyForm$.next(false))
    ).subscribe();
  }
}
