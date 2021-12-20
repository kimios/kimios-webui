import {Component, Input, OnInit} from '@angular/core';
import {DMEntity, Folder, FolderService, User} from 'app/kimios-client-api';
import {FormBuilder, FormGroup} from '@angular/forms';
import {combineLatest, Observable, of} from 'rxjs';
import {concatMap, filter, map, startWith, tap} from 'rxjs/operators';
import {CacheSecurityService} from 'app/services/cache-security.service';
import {EntityCacheService} from 'app/services/entity-cache.service';
import {SessionService} from 'app/services/session.service';

@Component({
  selector: 'container-entity-data',
  templateUrl: './container-entity-data.component.html',
  styleUrls: ['./container-entity-data.component.scss']
})
export class ContainerEntityDataComponent implements OnInit {
  @Input()
  entity: DMEntity;
  @Input()
  entityType: string;
  entityEditForm: FormGroup;
  filteredUsers$: Observable<Array<User>>;
  allUsers: Array<User>;
  init = false;
  entityOwner: User;
  isAdmin$: Observable<boolean>;
  canBeMoved = false;
  isWriteable = false;

  constructor(
    private fb: FormBuilder,
    private cacheSecurityService: CacheSecurityService,
    private entityCacheService: EntityCacheService,
    private sessionService: SessionService,
    private folderService: FolderService
  ) {

  }

  ngOnInit(): void {
    this.entityEditForm = this.fb.group({
      'name': this.fb.control(this.entity.name),
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
            const owner = this.extractEntityOwnerFromAllUsers(users, this.entity);
            if (owner != null) {
              this.entityOwner = owner;
              this.entityEditForm.get('owner').setValue(owner);
            }
            this.init = true;
          }
        }),
        map(([searchTerm, users]) => users)
      );

    this.isAdmin$ = this.sessionService.currentUserIsAdmin();

    this.folderService.canBeMoved(this.sessionService.sessionToken, this.entity.uid).subscribe(
      res => this.canBeMoved = res,
      error => this.canBeMoved = false
    );

    this.folderService.isWriteable(this.sessionService.sessionToken, this.entity.uid).subscribe(
      res => this.isWriteable = res,
      error => this.isWriteable = false
    );
  }

  submit(): void {
    this.entityCacheService.updateFolder(
      this.entity.uid,
      this.entityEditForm.get('name').value,
      // todo : handle entity move
      (this.entity as Folder).parentUid
    ).pipe(
      tap(() => {
        this.entity = this.entityCacheService.getEntity(this.entity.uid);
        this.entityEditForm.get('name').setValue(this.entity.name);
        this.init = false;
        this.entityEditForm.get('owner').setValue('');
      }),
    ).subscribe(
      res => console.log('folder updated'),
      error => console.log('error during update ' + error.error.message),
      null
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
  }

  private resetEditForm(): void {
    this.entityEditForm.get('name').setValue(this.entity.name);
    this.entityEditForm.get('owner').setValue(this.extractEntityOwnerFromAllUsers(this.allUsers, this.entity));
  }

  private extractEntityOwnerFromAllUsers(users: Array<User>, entity: DMEntity): User {
    const idx = users.findIndex(user => user.uid === entity.owner && user.source === entity.ownerSource);
    return idx !== -1 ?
      users[idx] :
      null;
  }

  openChooseFolderDialog(): void {

  }
}
